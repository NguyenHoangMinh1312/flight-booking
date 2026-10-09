import { TicketCanceledListener } from "../ticket-canceled-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { FlightStatus, TicketCanceledEvent, OrderStatus, Subjects } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Ticket } from "../../../models/ticket"
import { Order } from "../../../models/order"
import { Outbox } from "../../../models/outbox"

const buildTicket = async (ticketId?: string) => {
  const ticket = Ticket.build({
    id: ticketId || new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    class: "business",
    status: FlightStatus.Available,
    seat: {
      row: 1,
      column: 1
    },
    departureDate: new Date()
  })
  await ticket.save()

  return ticket
}

it(
  "Checks if the listener ignores the event ticket:canceled with incorrect version",
  async () => {
    // create a ticket
    const ticket = await buildTicket()

    // create an event listener
    const listener = new TicketCanceledListener(natsWrapper.nc)

    // create a fake event
    const data: TicketCanceledEvent["data"] = {
      id: ticket.id,
      version: ticket.version + 2
    }

    // fake the ack function
    const msg = {
      ack: jest.fn()
    } as unknown as JsMsg

    // call the listener
    try {
      await listener.onMessage(data, msg)
    } catch (err) {

    }

    // check if the ack is called
    expect(msg.ack).not.toHaveBeenCalled()
  }
)

it(
  "Checks if the listener handles event ticket:canceled successfully for unreserved ticket",
  async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString()
    // create a ticket
    const ticket = await buildTicket(ticketId)

    // create an event listener
    const listener = new TicketCanceledListener(natsWrapper.nc)

    // create a fake event
    const data: TicketCanceledEvent["data"] = {
      id: ticket.id,
      version: ticket.version + 1
    }

    // fake the ack function
    const msg = {
      ack: jest.fn()
    } as unknown as JsMsg

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is updated
    const updatedTicket = await Ticket.findById(ticketId)
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.status).toEqual(FlightStatus.Canceled)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)

it(
  "Checks if the listener handles event ticket:canceled successfully for reserved but unpaid ticket",
  async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString()
    // create a ticket
    const ticket = await buildTicket(ticketId)

    // create an order associated with the ticket
    const order = Order.build({
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticket
    })
    await order.save()

    // create an event listener
    const listener = new TicketCanceledListener(natsWrapper.nc)

    // create a fake event
    const data: TicketCanceledEvent["data"] = {
      id: ticket.id,
      version: ticket.version + 1
    }

    // fake the ack function
    const msg = {
      ack: jest.fn()
    } as unknown as JsMsg

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is updated
    const updatedTicket = await Ticket.findById(ticketId)
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.status).toEqual(FlightStatus.Canceled)

    // check if order status is updated
    const updatedOrder = await Order.findById(order.id)
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
    const ticketId = new mongoose.Types.ObjectId().toHexString()
    // create a ticket
    const ticket = await buildTicket(ticketId)

    // create an order associated with the ticket
    const order = Order.build({
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Complete,
      expiresAt: new Date(),
      ticket
    })
    await order.save()

    // create an event listener
    const listener = new TicketCanceledListener(natsWrapper.nc)

    // create a fake event
    const data: TicketCanceledEvent["data"] = {
      id: ticket.id,
      version: ticket.version + 1
    }

    // fake the ack function
    const msg = {
      ack: jest.fn()
    } as unknown as JsMsg

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is updated
    const updatedTicket = await Ticket.findById(ticketId)
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.status).toEqual(FlightStatus.Canceled)

    // check if order status is updated
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.AwaitingRefund)

    // check if the event is saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(1)
    expect(outboxEvents[0]?.eventType).toEqual(Subjects.OrderAwaitingRefund)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)
