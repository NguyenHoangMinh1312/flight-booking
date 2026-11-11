import { FlightDoc, Flight } from "../models/flight"
import { Airport } from "../models/airport"
import { Ticket } from "../models/ticket"
import { Outbox } from "../models/outbox"
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher"
import { BadRequestError } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"

export const createFlight = async (
  flightNumber: string,
  description: string,
  departure: FlightDoc["departure"],
  arrival: FlightDoc["arrival"],
  rows: number,
  classConfig: FlightDoc["classConfig"]
) => {
  // validate the airport
  const departureAirport = await Airport.findOne({ code: departure.airport })
  if (!departureAirport)
    throw new BadRequestError("Invalid departure airport code")

  const arrivalAirport = await Airport.findOne({ code: arrival.airport })
  if (!arrivalAirport)
    throw new BadRequestError("Invalid arrival airport code")

  // create the flight and tickets
  const session = await mongoose.startSession()
  try {
    session.startTransaction();

    // Save the flight 
    const flight = Flight.build({
      flightNumber,
      description,
      departure,
      arrival,
      rows,
      classConfig
    })
    await flight.save({ session })

    // Save the tickets
    const tickets = []

    for (let r = 1; r <= rows; r++) {
      const config = classConfig.find((item) => {
        if (!item.fromRow || !item.toRow)
          return false
        return r >= item.fromRow && r <= item.toRow
      })

      if (!config)
        continue

      for (let c = 1; c <= config.columns; c++) {
        const ticket = Ticket.build({
          flight,
          price: config.price,
          class: config.class,
          status: flight.status,
          seat: { row: r, column: c }
        })
        tickets.push(ticket)
      }
    }
    await Ticket.insertMany(tickets, { session })

    // save events to outbox
    const outboxEvents = tickets.map((ticket) => {
      return TicketCreatedPublisher.buildOutboxEvent({
        id: ticket.id,
        version: ticket.version,
        price: ticket.price,
        class: ticket.class,
        status: ticket.status,
        seat: ticket.seat,
        departureDate: ticket.flight.departure.date,
        departureAirport: ticket.flight.departure.airport,
        arrivalAirport: ticket.flight.arrival.airport,
      })
    })
    await Outbox.insertMany(outboxEvents, { session })

    // commit db transaction
    await session.commitTransaction()

    return flight
  } catch (err) {
    await session.abortTransaction();
    throw new Error("Something went wrong. Please try again")
  } finally {
    await session.endSession()
  }
}