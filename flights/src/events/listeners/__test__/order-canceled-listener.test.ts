import { OrderCanceledListener } from "../order-canceled-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCanceledEvent, Subjects } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Ticket } from "../../../models/ticket"
import { Flight, FlightClass } from "../../../models/flight"
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
    seat: {
      row: 10,
      column: 10
    },
    orderId: new mongoose.Types.ObjectId().toHexString(),
    status: flight.status
  })
  await ticket.save()

  return ticket
}

it(
  "Checks if the listener handles event order:canceled successfully",
  async () => {
    // create an event listener
    const listener = new OrderCanceledListener(natsWrapper.nc)

    // create a ticket
    const ticket = await buildTicket()

    //Create a fake event
    const data: OrderCanceledEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 1,
      ticket: {
        id: ticket.id
      },
      userId: new mongoose.Types.ObjectId().toHexString()
    }

    // fake the ack function
    const msg = {
      ack: jest.fn()
    } as unknown as JsMsg

    // call the listener
    await listener.onMessage(data, msg)

    // check if the orderId field is removed from the ticket
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket!.orderId).toBeUndefined()

    // check if the event is saved to outbox
    const outboxEvent = await Outbox.find({})
    expect(outboxEvent).toBeDefined()
    expect(outboxEvent).toHaveLength(1)
    expect(outboxEvent[0]?.eventType).toEqual(Subjects.TicketUpdated)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)
