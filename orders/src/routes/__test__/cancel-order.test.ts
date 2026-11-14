import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import { Order } from "../../models/order"
import { OrderStatus, FlightStatus, RefundReason, UserRole, Subjects } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Outbox } from "../../models/outbox"

const setup = async (
  orderStatus: OrderStatus = OrderStatus.Created,
  departureDate: Date = new Date(Date.now() + 5 * 60 * 60 * 1000)
) => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    class: "business",
    status: FlightStatus.Available,
    seat: {
      row: 1,
      column: 1
    },
    departureDate,
    departureAirport: "HAN",
    arrivalAirport: "SGN"
  })
  await ticket.save()

  const user = global.signin()
  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: orderStatus,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    ticket
  })

  // create order via API if departureDate is valid, otherwise build directly in DB
  if (departureDate.getTime() > Date.now() + 3 * 60 * 60 * 1000) {
    const orderCreateRes = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    const createdOrder = await Order.findById(orderCreateRes.body.id)
    if (orderStatus !== OrderStatus.Created) {
      createdOrder!.set({ status: orderStatus })
      await createdOrder!.save()
    }
    return { ticket, user, order: createdOrder! }
  }

  await order.save()
  return { ticket, user, order }
}

it(
  "Returns 401 if the user is not authenticated",
  async () => {
    const { order } = await setup()

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .send({
        refundReason: RefundReason.Emergency
      })
      .expect(401)
  }
)

it(
  "Returns 400 if refundReason is missing or not a valid enum value",
  async () => {
    const { user, order } = await setup()

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send({})
      .expect(400)

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send({
        refundReason: "invalid-reason"
      })
      .expect(400)
  }
)

it(
  "Returns 400 if a customer sends FlightCanceled refund reason",
  async () => {
    const { user, order } = await setup()

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send({
        refundReason: RefundReason.FlightCanceled
      })
      .expect(400)
  }
)

it(
  "Returns 404 if the order does not exist",
  async () => {
    const nonExistentOrderId = new mongoose.Types.ObjectId().toHexString()

    await request(app)
      .delete(`/api/orders/${nonExistentOrderId}`)
      .set("Cookie", global.signin())
      .send({
        refundReason: RefundReason.Emergency
      })
      .expect(404)
  }
)

it(
  "Returns 401 if a user tries to delete order of another user",
  async () => {
    const { order } = await setup()

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", global.signin())
      .send({
        refundReason: RefundReason.Emergency
      })
      .expect(401)
  }
)

it(
  "Returns 400 if a user cancels an order less than 3 hours before departure",
  async () => {
    const { ticket, user, order } = await setup()
    ticket.set({ departureDate: new Date(Date.now() + 2 * 60 * 60 * 1000) })
    await ticket.save()

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send({
        refundReason: RefundReason.Emergency
      })
      .expect(400)
  }
)

it(
  "Returns 400 if a user cancels invalid order (already canceled order)",
  async () => {
    const { user, order } = await setup(OrderStatus.Canceled)

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send({
        refundReason: RefundReason.Emergency
      })
      .expect(400)
  }
)

it(
  "Returns 400 if a user tries to cancel an order that is already awaiting refund",
  async () => {
    const { user, order } = await setup(OrderStatus.AwaitingRefund)

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send({
        refundReason: RefundReason.Emergency
      })
      .expect(400)
  }
)

it(
  "Returns 200 if a user cancels an unpaid order successfully",
  async () => {
    const { user, order } = await setup(OrderStatus.Created)

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send({
        refundReason: RefundReason.Emergency
      })
      .expect(200)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.Canceled)

    const outboxEvents = await Outbox.find({ eventType: Subjects.OrderCanceled })
    expect(outboxEvents).toHaveLength(1)
  }
)

it(
  "Returns 200 if a user cancels a paid (Complete) order successfully",
  async () => {
    const { user, order } = await setup(OrderStatus.Complete)

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send({
        refundReason: RefundReason.Emergency
      })
      .expect(200)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.AwaitingRefund)
    expect(updatedOrder!.refundReason).toEqual(RefundReason.Emergency)

    const outboxEvents = await Outbox.find({ eventType: Subjects.OrderAwaitingRefund })
    expect(outboxEvents).toHaveLength(1)
  }
)

it(
  "Returns 200 if a user retries canceling an order with RefundFailed status",
  async () => {
    const { user, order } = await setup(OrderStatus.RefundFailed)

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send({
        refundReason: RefundReason.Emergency
      })
      .expect(200)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.AwaitingRefund)
    expect(updatedOrder!.refundReason).toEqual(RefundReason.Emergency)

    const outboxEvents = await Outbox.find({ eventType: Subjects.OrderAwaitingRefund })
    expect(outboxEvents).toHaveLength(1)
  }
)

it(
  "Returns 200 if a manager cancels another user's order with FlightCanceled reason",
  async () => {
    const { order } = await setup(OrderStatus.Complete)

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", global.signin(UserRole.Manager))
      .send({
        refundReason: RefundReason.FlightCanceled
      })
      .expect(200)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.AwaitingRefund)
    expect(updatedOrder!.refundReason).toEqual(RefundReason.FlightCanceled)
  }
)
