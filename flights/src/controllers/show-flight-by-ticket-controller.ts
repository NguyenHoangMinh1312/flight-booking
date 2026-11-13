import { Request, Response } from "express"
import { Ticket } from "../models/ticket"
import { NotFoundError } from "@mint1312-flight-booking/common"

type ReqParams = {
  ticketId: string
}

export const showFlightByTicketController = async (
  req: Request<ReqParams>,
  res: Response
) => {
  const ticket = await Ticket.findById(req.params.ticketId).populate("flight")

  if (!ticket)
    throw new NotFoundError()

  const flight = await ticket.flight.populate([
    {
      path: "arrival.airport",
      foreignField: "code"
    },
    {
      path: "departure.airport",
      foreignField: "code"
    }
  ])

  res.send(flight)
}