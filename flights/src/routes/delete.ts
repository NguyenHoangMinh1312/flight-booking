import express, { Request, Response } from "express"
import { Flight } from "../models/flight"
import { requireAuth, requireManager, BadRequestError, FlightStatus, NotFoundError } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Ticket } from "../models/ticket"
import { TicketCanceledPublisher } from "../events/publishers/ticket-canceled-publisher"
import { Outbox } from "../models/outbox"

const router = express.Router()

router.delete(
  "/api/flights/:id",
  requireAuth,
  requireManager,
  async (req: Request, res: Response) => {
    // find the flight
    const flight = await Flight.findById(req.params.id)
    if (!flight)
      throw new NotFoundError()

    if (flight.status === FlightStatus.Canceled)
      throw new BadRequestError("Flight is already canceled")

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // set the flight status to canceled
      flight.set({ status: FlightStatus.Canceled })
      await flight.save({ session })

      // find all the tickets associated with the flight
      const tickets = await Ticket.find({ flight: flight._id })
      if (!tickets)
        return res.send({ message: "Cancellation is finished" })

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

      // response
      res.send({ message: "Cancellation is under process" })

    } catch (err) {
      await session.abortTransaction();
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
    }
  }
)

export { router as deleteFlightRouter }