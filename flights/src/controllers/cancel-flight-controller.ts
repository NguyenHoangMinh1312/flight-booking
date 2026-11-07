import { Request, Response } from "express"
import { cancelFlight } from "../services/cancel-flight-service"
import { BadRequestError } from "@mint1312-flight-booking/common"

export const cancelFlightController = async (
  req: Request,
  res: Response
) => {
  const flightId = req.params.id

  if (typeof flightId !== "string")
    throw new BadRequestError("Invalid flight id")

  await cancelFlight(flightId)

  res.send({ message: "Cancellation is under process" })
}