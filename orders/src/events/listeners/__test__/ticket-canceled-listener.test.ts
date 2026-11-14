import { TicketCanceledListener } from "../ticket-canceled-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { FlightStatus, TicketCanceledEvent, OrderStatus, Subjects, RefundReason } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Ticket } from "../../../models/ticket"
import { Order, OrderDoc } from "../../../models/order"
import { Outbox } from "../../../models/outbox"

const setup = async (orderStatus?: OrderStatus) => {
  // create an event listener
  const listener = new TicketCanceledListener(natsWrapper.nc)

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

  let order: OrderDoc | undefined
  if (orderStatus) {
    order = Order.build({
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: orderStatus,
      expiresAt: new Date(),
      ticket
    })
    await order.save()
  }

  // create a fake event
  const data: TicketCanceledEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1
  }

  // fake the ack function
  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, ticket, order, data, msg }
}

it(
  "Throws an error and does not ack if the ticket is not found",
  async () => {
    const { listener, data, msg } = await setup()
    data.id = new mongoose.Types.ObjectId().toHexString()

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Ticket not found")

    expect(msg.ack).not.toHaveBeenCalled()
  }
)

it(
  "Acks the message and ignores the event if it has already been processed",
  async () => {
    const { listener, ticket, data, msg } = await setup()
    data.version = ticket.version

    await listener.onMessage(data, msg)

    const unchangedTicket = await Ticket.findById(ticket.id)
    expect(unchangedTicket!.status).toEqual(FlightStatus.Available)
    expect(msg.ack).toHaveBeenCalled()
  }
)

it(
  "Checks if the listener ignores the event ticket:canceled with incorrect version",
  async () => {
    const { listener, ticket, data, msg } = await setup()
    data.version = ticket.version + 2

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Out of order event received")

    // check if the ack is called
    expect(msg.ack).not.toHaveBeenCalled()
  }
)

it(
  "Checks if the listener handles event ticket:canceled successfully for unreserved ticket",
  async () => {
    const { listener, ticket, data, msg } = await setup()

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is updated
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.status).toEqual(FlightStatus.Canceled)

    // no outbox events should be created when there are no orders
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toHaveLength(0)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)

it(
  "Checks if the listener handles event ticket:canceled successfully for reserved but unpaid ticket",
  async () => {
    const { listener, ticket, order, data, msg } = await setup(OrderStatus.Created)

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is updated
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.status).toEqual(FlightStatus.Canceled)

    // check if order status is updated
    const updatedOrder = await Order.findById(order!.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.Canceled)

    // check if the event is saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(1)
    expect(outboxEvents[0]?.eventType).toEqual(Subjects.OrderCanceled)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)

it(
  "Checks if the listener handles event ticket:canceled successfully for paid ticket",
  async () => {
    const { listener, ticket, order, data, msg } = await setup(OrderStatus.Complete)

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is updated
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.status).toEqual(FlightStatus.Canceled)

    // check if order status is updated
    const updatedOrder = await Order.findById(order!.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.AwaitingRefund)
    expect(updatedOrder!.refundReason).toEqual(RefundReason.FlightCanceled)

    // check if the event is saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(1)
    expect(outboxEvents[0]?.eventType).toEqual(Subjects.OrderAwaitingRefund)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)

it(
  "Checks if the listener handles event ticket:canceled successfully for order with RefundFailed status",
  async () => {
    const { listener, ticket, order, data, msg } = await setup(OrderStatus.RefundFailed)

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is updated
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.status).toEqual(FlightStatus.Canceled)

    // check if order status is updated
    const updatedOrder = await Order.findById(order!.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.AwaitingRefund)
    expect(updatedOrder!.refundReason).toEqual(RefundReason.FlightCanceled)

    // check if the event is saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toHaveLength(1)
    expect(outboxEvents[0]?.eventType).toEqual(Subjects.OrderAwaitingRefund)

    expect(msg.ack).toHaveBeenCalled()
  }
)
