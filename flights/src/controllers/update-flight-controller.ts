import { Request, Response } from "express"
import { updateFlight } from "../services/update-flight-service"
import { FlightClass, FlightDoc } from "../models/flight"

type ReqParams = {
  id: string
}

type ReqBody = {
  description: string,
  priceConfig: {
    class: FlightClass,
    price: number
  }[]
}

export const updateFlightController = async (
  req: Request<ReqParams, any, ReqBody>,
  res: Response
) => {

  const flight = await updateFlight(
    req.params.id,
    req.body.description,
    req.body.priceConfig
  )

  res.send(flight)
}