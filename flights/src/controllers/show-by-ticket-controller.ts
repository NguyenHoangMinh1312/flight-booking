import { Request, Response } from "express"
import { Ticket } from "../models/ticket"
import { NotFoundError } from "@mint1312-flight-booking/common"

type ReqParams = {
  ticketId: string
}

export const showByTicketController = async (
  req: Request<ReqParams>,
  res: Response
) => {
  const ticket = await Ticket.findById(req.params.ticketId).populate("flight")

  if (!ticket)
    throw new NotFoundError()

  res.send(ticket.flight)
}