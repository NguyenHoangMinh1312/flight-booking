import { Request, Response } from "express";
import { FlightDoc } from "../models/flight";
import { createFlight } from "../services/create-flight-service";
import { BadRequestError } from "@mint1312-flight-booking/common";

type ReqBody = {
  flightNumber: string,
  description: string,
  departure: FlightDoc["departure"],
  arrival: FlightDoc["arrival"],
  seatConfig: FlightDoc["seatConfig"],
  priceConfig: FlightDoc["priceConfig"]
}

export const createFlightController = async (
  req: Request<any, any, ReqBody>,
  res: Response
) => {
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
    if (classConfig.fromRow > classConfig.toRow)
      throw new BadRequestError(
        `Starting row (${classConfig.fromRow}) cannot be greater than ending row (${classConfig.toRow}) for ${classConfig.class} class`
      )

    if (classConfig.toRow > seatConfig.rows)
      throw new BadRequestError(
        `Ending row (${classConfig.toRow}) for ${classConfig.class} class exceeds total rows (${seatConfig.rows})`
      )
  }

  for (let i = 0; i < seatConfig.classes.length; i++) {
    for (let j = i + 1; j < seatConfig.classes.length; j++) {
      const a = seatConfig.classes[i]
      const b = seatConfig.classes[j]

      if (!a || !b)
        continue

      if (a.fromRow <= b.toRow && b.fromRow <= a.toRow)
        throw new BadRequestError(
          `Seat class row ranges overlap between ${a.class} (rows ${a.fromRow}-${a.toRow}) and ${b.class} (rows ${b.fromRow}-${b.toRow})`
        )
    }
  }

  // create flight
  const flight = await createFlight(
    flightNumber,
    description,
    departure,
    arrival,
    seatConfig,
    priceConfig
  )

  res.status(201).send(flight)
}