import { NotFoundError, BadRequestError, FlightStatus } from "@mint1312-flight-booking/common"
import { Flight } from "../models/flight"
import mongoose from "mongoose"
import { Outbox } from "../models/outbox"
import { Ticket } from "../models/ticket"
import { TicketCanceledPublisher } from "../events/publishers/ticket-canceled-publisher"

export const cancelFlight = async (flightId: string) => {
  // validate flight
  const flight = await Flight.findById(flightId)

  if (!flight)
    throw new NotFoundError()

  if (flight.status === FlightStatus.Canceled)
    throw new BadRequestError("Flight is already canceled")

  // cancel flight
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // set the flight status to canceled
    flight.set({ status: FlightStatus.Canceled })
    await flight.save({ session })

    // find all the tickets associated with the flight
    const tickets = await Ticket.find({ flight: flight._id })

    // set all the ticket status to canceled
    await Promise.all(tickets.map(ticket => {
      ticket.set({ status: FlightStatus.Canceled })
      return ticket.save({ session })
    }))

    // save the events to outbox
    const outboxEvents = tickets.map((ticket) => {
      return TicketCanceledPublisher.buildOutboxEvent({
        id: ticket.id,
        version: ticket.version,
      })
    })
    await Outbox.insertMany(outboxEvents, { session })

    // commit db transaction
    await session.commitTransaction()

  } catch (err) {
    await session.abortTransaction();
    throw new Error("Something went wrong. Please try again")
  } finally {
    await session.endSession()
  }
}

