import { Request, Response } from "express"
import { updateFlight } from "../services/update-flight-service"
import { FlightDoc } from "../models/flight"

type updateFlightArgs = {
  flightId: string,
  description: string,
  priceConfig: FlightDoc["priceConfig"]
}

export const updateFlightController = async (
  req: Request,
  res: Response
) => {
  const args = {
    flightId: req.params.id,
    ...req.body
  } as updateFlightArgs

  const flight = await updateFlight(args.flightId, args.description, args.priceConfig)

  res.send(flight)
}