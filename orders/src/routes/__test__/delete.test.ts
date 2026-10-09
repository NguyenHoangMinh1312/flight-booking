import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import { Order } from "../../models/order"
import { OrderStatus, FlightStatus } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Outbox } from "../../models/outbox"

const buildTicket = async () => {
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
    departureDate: new Date(Date.now() + 5 * 60 * 60 * 1000)
  })
  await ticket.save()

  return ticket
}

it(
  "Returns 401 if a user tries to delete order of another user",
  async () => {
    // Create a ticket
    const ticket = await buildTicket()

    // Create order 
    const order = await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    // Make request to delete order
    await request(app)
      .delete(`/api/orders/${order.body.id}`)
      .set("Cookie", global.signin())
      .expect(401)
  }
)

it(
  "Returns 200 if a user cancels an unpaid order successfully",
  async () => {
    // Create a ticket
    const ticket = await buildTicket()

    // Create order 
    const user = global.signin()
    const order = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    // Make request to delete order
    await request(app)
      .delete(`/api/orders/${order.body.id}`)
      .set("Cookie", user)
      .expect(200)

    // get the order from MongoDB
    const updatedOrder = await Order.findById(order.body.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.Canceled)

    // expect the event to be saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(1 + 1)
  }
)

it(
  "Returns 200 if a user cancels a paid order successfully",
  async () => {
    // Create a ticket
    const ticket = await buildTicket()

    // Create a paid order 
    const user = global.signin()
    const orderCreateRes = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: ticket.id
      })
      .expect(201)
    const order = await Order.findById(orderCreateRes.body.id)
    order?.set({
      status: OrderStatus.RefundFailed
    })
    await order?.save()

    // Make request to refund paid order
    await request(app)
      .delete(`/api/orders/${order?.id}`)
      .set("Cookie", user)
      .expect(200)

    // get the order from MongoDB
    const updatedOrder = await Order.findById(order?.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.AwaitingRefund)

    // expect the event to be saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(1 + 1)
  }
)

it(
  "Returns 400 if a user cancels invalid order (canceled order) ",
  async () => {
    // Create a ticket
    const ticket = await buildTicket()

    // Create a paid order 
    const user = global.signin()
    const orderCreateRes = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: ticket.id
      })
      .expect(201)
    const order = await Order.findById(orderCreateRes.body.id)
    order?.set({
      status: OrderStatus.Canceled
    })
    await order?.save()

    // Make request to refund paid order
    await request(app)
      .delete(`/api/orders/${order?.id}`)
      .set("Cookie", user)
      .expect(400)
  }
)
