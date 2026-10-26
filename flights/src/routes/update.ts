import express, { Request, Response } from "express"
import { body } from "express-validator"
import { NotFoundError, requireAuth, requireManager, validateRequest } from "@mint1312-flight-booking/common"
import { Flight } from "../models/flight"
import { Ticket } from "../models/ticket"
import mongoose from "mongoose"
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher"
import { Outbox } from "../models/outbox"

const router = express.Router()

// allow the manager to change priceConfig and description after creating a flight. Others changes are prohibitted
router.put(
  "/api/flights/:id",
  requireAuth,
  requireManager,
  [
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("priceConfig")
      .isObject()
      .withMessage("Price configuration is required"),
    body("priceConfig.first")
      .isFloat({ gt: 0 })
      .withMessage("First-class price must be positive"),
    body("priceConfig.business")
      .isFloat({ gt: 0 })
      .withMessage("Business-class price must be positive"),
    body("priceConfig.economy")
      .isFloat({ gt: 0 })
      .withMessage("Economy-class price must be positive")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { description, priceConfig } = req.body

    // find the flight
    const flight = await Flight.findById(req.params.id)
    if (!flight)
      throw new NotFoundError()

    // db transaction
    const session = await mongoose.startSession();

    try {
      session.startTransaction()

      // Update the flight
      flight.set({ description, priceConfig })
      await flight.save({ session })

      // Find tickets that has not been ordered
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

      // response 
      res.status(200).send(flight)
    } catch (err) {
      await session.abortTransaction();
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
    }
  }
)

export { router as updateFlightRouter }
