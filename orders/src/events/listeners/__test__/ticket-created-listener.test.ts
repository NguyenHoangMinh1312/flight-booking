import { TicketCreatedListener } from "../ticket-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { FlightStatus, TicketCreatedEvent } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Ticket } from "../../../models/ticket"

it(
  "Checks if the listener handles event ticket:created successfully",
  async () => {
    // create an event listener
    const listener = new TicketCreatedListener(natsWrapper.nc)

    // create a fake event
    const data: TicketCreatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      price: 10,
      class: "business",
      status: FlightStatus.Available,
      seat: {
        row: 1,
        column: 1
      },
      departureDate: new Date()
    }

    // fake the ack function
    const msg = {
      ack: jest.fn()
    } as unknown as JsMsg

    // call the listener
    await listener.onMessage(data, msg)

    // check if the ticket is created
    const ticket = await Ticket.findById(data.id)
    expect(ticket).toBeDefined()
    expect(ticket!.version).toEqual(data.version)
    expect(ticket!.price).toEqual(data.price)
    expect(ticket!.class).toEqual(data.class)
    expect(ticket!.seat).toEqual(data.seat)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()
  }
)
