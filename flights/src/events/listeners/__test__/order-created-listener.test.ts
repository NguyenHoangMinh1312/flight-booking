import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedEvent, Subjects } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"
import { Flight, FlightClass } from "../../../models/flight"
import { OrderStatus } from "@mint1312-flight-booking/common"
import { Outbox } from "../../../models/outbox"

const buildTicket = async () => {
  const flight = Flight.build({
    flightNumber: "VN123",
    description: "Hanoi to Ho Chi Minh City",
    departure: {
      airport: "Noi Bai",
      date: new Date()
    },
    arrival: {
      airport: "Tan Son Nhat",
      date: new Date()
    },
    seatConfig: {
      rows: 2,
      columns: 2,
      classes: [
        {
          class: FlightClass.Economy,
          fromRow: 1,
          toRow: 2
        }
      ]
    },
    priceConfig: {
      "first": 1000000,
      "business": 500000,
      "economy": 200000
    }
  })
  await flight.save()

  const ticket = Ticket.build({
    flight,
    price: 10,
    class: FlightClass.Economy,
    status: flight.status,
    seat: {
      row: 10,
      column: 10
    },
    orderId: new mongoose.Types.ObjectId().toHexString()
  })
  await ticket.save()

  return ticket
}

it(
  "Checks if the listener handles event order:created successfully",
  async () => {
    // create an event listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // create and save a ticket
    const ticket = await buildTicket()

    //Create a fake event
    const data: OrderCreatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      expiresAt: new Date().toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    }

    // fake the ack function
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn()
    }

    // call the listener
    await listener.onMessage(data, msg)

    // check if the orderId is assigned to the ticket
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket?.orderId).toEqual(data.id)

    // check if the event is saved to outbox
    const outboxEvent = await Outbox.find({})
    expect(outboxEvent).toBeDefined()
    expect(outboxEvent).toHaveLength(1)
    expect(outboxEvent[0]?.eventType).toEqual(Subjects.TicketUpdated)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)
