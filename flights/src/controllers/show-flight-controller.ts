import { Request, Response } from "express"
import { Ticket } from "../models/ticket"
import { NotFoundError } from "@mint1312-flight-booking/common"
import { Flight } from "../models/flight"

type ReqParams = {
  id: string
}

export const showFlightController = async (
  req: Request<ReqParams>,
  res: Response
) => {
  // find the flight
  const flight = await Flight.findById(req.params.id)

  if (!flight)
    throw new NotFoundError()

  // find all associated tickets
  const tickets = await Ticket.find({ flight: flight._id })

  res.send({ flight, tickets })
}