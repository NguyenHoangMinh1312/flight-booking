import { TicketUpdatedListener } from "../ticket-updated-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { FlightStatus, TicketUpdatedEvent } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Ticket } from "../../../models/ticket"

const setup = async () => {
  // create an event listener
  const listener = new TicketUpdatedListener(natsWrapper.nc)

  // create and save a ticket
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

  // create a fake event
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    price: 100,
    class: "business",
    status: FlightStatus.Available,
    seat: {
      row: 10,
      column: 10
    },
    departureDate: new Date(),
    departureAirport: "HAN",
    arrivalAirport: "SGN"
  }

  // fake the ack function
  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, ticket, data, msg }
}

it(
  "Throws an error and does not ack if the ticket does not exist",
  async () => {
    const { listener, data, msg } = await setup()
    data.id = new mongoose.Types.ObjectId().toHexString()

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Ticket not found")

    expect(msg.ack).not.toHaveBeenCalled()
  }
)

it(
  "Acks the message and does not update the ticket if the event version was already processed",
  async () => {
    const { listener, ticket, data, msg } = await setup()
    data.version = ticket.version

    await listener.onMessage(data, msg)

    const unchangedTicket = await Ticket.findById(ticket.id)
    expect(unchangedTicket!.price).toEqual(ticket.price)
    expect(msg.ack).toHaveBeenCalled()
  }
)

it(
  "Checks if the listener ignores the event ticket:updated with incorrect version",
  async () => {
    const { listener, ticket, data, msg } = await setup()
    data.version = ticket.version + 2

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Out of order event received")

    // check if the ack is called
    expect(msg.ack).not.toHaveBeenCalled()
  }
)

it(
  "Checks if the listener handles event ticket:updated successfully",
  async () => {
    const { listener, ticket, data, msg } = await setup()

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is updated
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.version).toEqual(data.version)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.class).toEqual(data.class)
    expect(updatedTicket!.seat).toEqual(data.seat)
    expect(updatedTicket!.departureDate).toEqual(data.departureDate)
    expect(updatedTicket!.departureAirport).toEqual(data.departureAirport)
    expect(updatedTicket!.arrivalAirport).toEqual(data.arrivalAirport)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)
