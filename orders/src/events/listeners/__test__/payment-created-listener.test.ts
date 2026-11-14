import { natsWrapper } from "../../../nats-wrapper"
import { Subjects, OrderStatus, PaymentCreatedEvent, FlightStatus } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Order } from "../../../models/order"
import { Ticket } from "../../../models/ticket"
import { Outbox } from "../../../models/outbox"
import { PaymentCreatedListener } from "../payment-created-listener"

const setup = async (orderStatus: OrderStatus = OrderStatus.Created) => {
  // create an event listener
  const listener = new PaymentCreatedListener(natsWrapper.nc)

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
    departureDate: new Date(),
    departureAirport: "HAN",
    arrivalAirport: "SGN"
  })
  await ticket.save()

  // create an order
  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: orderStatus,
    expiresAt: new Date(),
    ticket
  })
  await order.save()

  // create a fake event
  const data: PaymentCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    orderId: order.id
  }

  // fake the ack function
  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, ticket, order, data, msg }
}

it(
  "Throws an error and does not ack the message if the order is not found",
  async () => {
    const { listener, data, msg } = await setup()
    data.orderId = new mongoose.Types.ObjectId().toHexString()

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Order not found")

    expect(msg.ack).not.toHaveBeenCalled()
  }
)

it(
  "Acks the message and does not create an outbox event if the order is already complete",
  async () => {
    const { listener, data, msg } = await setup(OrderStatus.Complete)

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()

    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toHaveLength(0)
  }
)

it(
  "Checks if the listener handles event payment:created successfully",
  async () => {
    const { listener, ticket, order, data, msg } = await setup()

    // call the listener
    await listener.onMessage(data, msg)

    // check if the order status is updated
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder?.status).toEqual(OrderStatus.Complete)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()

    // expect the event to be saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(1)
    expect(outboxEvents[0]?.eventType).toEqual(Subjects.OrderComplete)
    expect(outboxEvents[0]?.payload).toMatchObject({
      id: order.id,
      userId: order.userId,
      ticket: {
        id: ticket.id
      }
    })
  }
)
