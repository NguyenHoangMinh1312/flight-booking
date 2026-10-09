import { TicketUpdatedListener } from "../ticket-updated-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { FlightStatus, TicketUpdatedEvent } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"

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
  "Checks if the listener ignores the event ticket:updated with incorrect version",
  async () => {
    // create a ticket
    const ticket = await buildTicket()

    // create an event listener
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // create a fake event
    const data: TicketUpdatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: ticket.version + 2,
      price: 10,
      class: "business",
      status: FlightStatus.Available,
      seat: {
        row: 1,
        column: 1
      },
      orderId: new mongoose.Types.ObjectId().toHexString(),
      departureDate: new Date()
    }

    // fake the ack function
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn()
    }

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
  "Checks if the listener handles event ticket:updated successfully",
  async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString()
    // create a ticket
    const ticket = await buildTicket(ticketId)

    // create an event listener
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // create a fake event
    const data: TicketUpdatedEvent["data"] = {
      id: ticketId,
      version: ticket.version + 1,
      price: 100,
      class: "business",
      status: FlightStatus.Available,
      seat: {
        row: 10,
        column: 10
      },
      orderId: new mongoose.Types.ObjectId().toHexString(),
      departureDate: new Date()
    }

    // fake the ack function
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn()
    }

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is updated
    const updatedTicket = await Ticket.findById(ticketId)
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.class).toEqual(data.class)
    expect(updatedTicket!.seat).toEqual(data.seat)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)
