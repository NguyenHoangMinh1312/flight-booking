import express, { Request, Response } from "express"
import { body } from "express-validator"
import { BadRequestError, requireAuth, requireManager, validateRequest } from "@mint1312-flight-booking/common"
import { Flight } from "../models/flight"
import { Ticket } from "../models/ticket"
import { TicketDoc } from "../models/ticket"
import mongoose from "mongoose"
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher"

const router = express.Router()

router.post(
  "/api/flights",
  requireAuth,
  requireManager,
  [
    body("flightNumber")
      .isString()
      .notEmpty()
      .withMessage("Flight number is required"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("departure")
      .isObject()
      .withMessage("Departure is required"),
    body("departure.airport")
      .isString()
      .notEmpty()
      .withMessage("Departure airport is required"),
    body("departure.date")
      .isISO8601()
      .toDate()
      .withMessage("Departure date must be a valid date"),
    body("arrival")
      .isObject()
      .withMessage("Arrival is required"),
    body("arrival.airport")
      .isString()
      .notEmpty()
      .withMessage("Arrival airport is required"),
    body("arrival.date")
      .isISO8601()
      .toDate()
      .withMessage("Arrival date must be a valid date"),
    body("seatConfig")
      .isObject()
      .withMessage("Seat configuration is required"),
    body("seatConfig.rows")
      .isInt({ gt: 0 })
      .withMessage("Seat rows must be a positive integer"),
    body("seatConfig.columns")
      .isInt({ gt: 0, lt: 27 })
      .withMessage("Seat columns must be a positive integer between 1 and 26"),
    body("seatConfig.classes")
      .isArray({ min: 1 })
      .withMessage("Seat classes must be a non-empty array"),
    body("seatConfig.classes.*.class")
      .isIn(["first", "business", "economy"])
      .withMessage("Seat class must be first, business, or economy"),
    body("seatConfig.classes.*.fromRow")
      .isInt({ min: 1 })
      .withMessage("Starting row must be a positive integer"),
    body("seatConfig.classes.*.toRow")
      .isInt({ min: 1 })
      .withMessage("Ending row must be a positive integer"),
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
    const {
      flightNumber,
      description,
      departure,
      arrival,
      seatConfig,
      priceConfig
    } = req.body

    // input validation
    if (departure.date >= arrival.date)
      throw new BadRequestError("Departure date must be earlier than arrival date")

    for (const classConfig of seatConfig.classes) {
      if (classConfig.fromRow > classConfig.toRow) {
        throw new BadRequestError(
          `Starting row (${classConfig.fromRow}) cannot be greater than ending row (${classConfig.toRow}) for ${classConfig.class} class`
        )
      }

      if (classConfig.toRow > seatConfig.rows) {
        throw new BadRequestError(
          `Ending row (${classConfig.toRow}) for ${classConfig.class} class exceeds total rows (${seatConfig.rows})`
        )
      }
    }

    for (let i = 0; i < seatConfig.classes.length; i++) {
      for (let j = i + 1; j < seatConfig.classes.length; j++) {
        const a = seatConfig.classes[i]
        const b = seatConfig.classes[j]
        if (a.fromRow <= b.toRow && b.fromRow <= a.toRow) {
          throw new BadRequestError(
            `Seat class row ranges overlap between ${a.class} (rows ${a.fromRow}-${a.toRow}) and ${b.class} (rows ${b.fromRow}-${b.toRow})`
          )
        }
      }
    }


    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction();

      // Save the flight 
      const flight = Flight.build({
        flightNumber,
        description,
        departure,
        arrival,
        seatConfig,
        priceConfig
      })
      await flight.save({ session })

      // Save the tickets
      const tickets: TicketDoc[] = []

      for (let r = 1; r <= seatConfig.rows; r++) {
        const classConfig = seatConfig.classes.find(
          ({ fromRow, toRow }: { fromRow: number; toRow: number }) => {
            return r >= fromRow && r <= toRow
          }
        )
        if (!classConfig)
          continue

        const price = priceConfig[classConfig.class]

        for (let c = 1; c <= seatConfig.columns; c++) {
          const ticket = Ticket.build({
            flight,
            price,
            class: classConfig.class,
            status: flight.status,
            seat: { row: r, column: c }
          })
          tickets.push(ticket)
        }
      }
      await Promise.all(tickets.map((ticket) => ticket.save({ session })))

      // save events to outbox
      const outboxEvents = tickets.map((ticket) => {
        return TicketCreatedPublisher.buildOutboxEvent({
          id: ticket.id,
          version: ticket.version,
          price: ticket.price,
          class: ticket.class,
          status: ticket.status,
          seat: ticket.seat,
          departureDate: ticket.flight.departure.date
        })
      })

      await Promise.all(outboxEvents.map((event) => event.save({ session })))

      // commit db transaction
      await session.commitTransaction()

      // response
      res.status(201).send(flight)
    } catch (err) {
      await session.abortTransaction();
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
    }
  }
)

export { router as createFlightRouter }
