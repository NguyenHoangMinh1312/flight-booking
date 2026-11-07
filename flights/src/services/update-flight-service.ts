import { FlightDoc } from "../models/flight";
import { Flight } from "../models/flight";
import { Ticket } from "../models/ticket";
import { Outbox } from "../models/outbox";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import mongoose from "mongoose";
import { NotFoundError } from "@mint1312-flight-booking/common";

export const updateFlight = async (
  flightId: string,
  description: string,
  priceConfig: FlightDoc["priceConfig"]
) => {
  // find the flight
  const flight = await Flight.findById(flightId)
  if (!flight)
    throw new NotFoundError()

  // Update the flight and tickets
  const session = await mongoose.startSession();
  try {
    session.startTransaction()

    flight.set({ description, priceConfig })
    await flight.save({ session })

    // Find tickets that have not been ordered
    const tickets = await Ticket.find({
      flight: flight._id,
      orderId: { $exists: false }
    }).populate("flight")

    // Save all updated tickets
    await Promise.all(tickets.map((ticket) => {
      ticket.set({ price: priceConfig[ticket.class] })
      return ticket.save({ session })
    }))

    // save events the outbox
    const outboxEvents = tickets.map((ticket) => {
      return TicketUpdatedPublisher.buildOutboxEvent({
        id: ticket.id,
        version: ticket.version,
        price: ticket.price,
        class: ticket.class,
        status: ticket.status,
        seat: ticket.seat,
        departureDate: flight.departure.date
      })
    })

    await Outbox.insertMany(outboxEvents, { session })

    // commit db transaction
    await session.commitTransaction();

    return flight
  } catch (err) {
    await session.abortTransaction();
    throw new Error("Something went wrong. Please try again")
  } finally {
    await session.endSession()
  }
}