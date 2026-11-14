import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedEvent, OrderStatus, Subjects } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Ticket } from "../../../models/ticket"
import { Flight, FlightClass } from "../../../models/flight"
import { Outbox } from "../../../models/outbox"

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.nc)

  const flight = Flight.build({
    flightNumber: "VN123",
    description: "Hanoi to Ho Chi Minh City",
    departure: {
      airport: "HAN",
      date: new Date("2026-09-04T17:39:50Z")
    },
    arrival: {
      airport: "SGN",
      date: new Date("2026-09-04T19:39:50Z")
    },
    rows: 2,
    classConfig: [
      {
        class: FlightClass.Economy,
        fromRow: 1,
        toRow: 2,
        columns: 2,
        price: 200000
      }
    ]
  })
  await flight.save()

  const ticket = Ticket.build({
    flight,
    price: 200000,
    class: FlightClass.Economy,
    status: flight.status,
    seat: {
      row: 1,
      column: 1
    }
  })
  await ticket.save()

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  }

  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, flight, ticket, data, msg }
}

it("Sets the orderId of the ticket when order:created event is received", async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket).toBeDefined()
  expect(updatedTicket!.orderId).toEqual(data.id)
  expect(updatedTicket!.version).toEqual(ticket.version + 1)
})

it("Acks the message after successfully processing the event", async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalledTimes(1)
})

it("Saves a TicketUpdated event to the outbox with correct payload", async () => {
  const { listener, flight, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const outboxEvents = await Outbox.find({})
  expect(outboxEvents).toHaveLength(1)
  expect(outboxEvents[0]!.eventType).toEqual(Subjects.TicketUpdated)
  expect(outboxEvents[0]!.payload).toMatchObject({
    id: ticket.id,
    version: ticket.version + 1,
    price: ticket.price,
    class: ticket.class,
    status: ticket.status,
    seat: ticket.seat,
    departureAirport: flight.departure.airport,
    arrivalAirport: flight.arrival.airport
  })
})

it("Throws an error and does not ack if the ticket is not found", async () => {
  const { listener, data, msg } = await setup()
  data.ticket.id = new mongoose.Types.ObjectId().toHexString()

  await expect(listener.onMessage(data, msg)).rejects.toThrow("Ticket not found")

  expect(msg.ack).not.toHaveBeenCalled()
  const outboxEvents = await Outbox.find({})
  expect(outboxEvents).toHaveLength(0)
})

it("Acks the message without duplicating updates if the orderId is already set to the same order", async () => {
  const { listener, ticket, data, msg } = await setup()

  ticket.set({ orderId: data.id })
  await ticket.save()
  const currentVersion = ticket.version

  await listener.onMessage(data, msg)

  const unchangedTicket = await Ticket.findById(ticket.id)
  expect(unchangedTicket!.version).toEqual(currentVersion)

  const outboxEvents = await Outbox.find({})
  expect(outboxEvents).toHaveLength(0)
  expect(msg.ack).toHaveBeenCalledTimes(1)
})

