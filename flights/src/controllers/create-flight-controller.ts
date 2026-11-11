import { Request, Response } from "express";
import { FlightClass, FlightDoc } from "../models/flight";
import { createFlight } from "../services/create-flight-service";
import { BadRequestError } from "@mint1312-flight-booking/common";

type ReqBody = {
  flightNumber: string,
  description: string,
  departure: FlightDoc["departure"],
  arrival: FlightDoc["arrival"],
  rows: number,
  classConfig: FlightDoc["classConfig"]
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
    rows,
    classConfig
  } = req.body

  // input validation
  if (departure.date >= arrival.date)
    throw new BadRequestError("Departure date must be earlier than arrival date")

  // check for class config
  for (const config of classConfig) {
    if (config.fromRow > config.toRow)
      throw new BadRequestError(
        `Starting row (${config.fromRow}) cannot be greater than ending row (${config.toRow}) for ${config.class} class`
      )

    if (config.toRow > rows)
      throw new BadRequestError(
        `Ending row (${config.toRow}) for ${config.class} class exceeds total rows (${rows})`
      )
  }

  // check the overlap between seat config
  const configSorted = classConfig.toSorted((a, b) => a.fromRow - b.fromRow)

  for (let i = 0; i < configSorted.length; i++) {
    for (let j = i + 1; j < configSorted.length; j++) {
      const a = configSorted[i]
      const b = configSorted[j]

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
    rows,
    classConfig
  )

  res.status(201).send(flight)
}