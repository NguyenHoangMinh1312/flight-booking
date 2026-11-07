import { Request, Response } from "express"
import { Ticket } from "../models/ticket"
import { NotFoundError } from "@mint1312-flight-booking/common"

export const showByTicketController = async (
  req: Request,
  res: Response
) => {
  const { ticketId } = req.params

  const ticket = await Ticket.findById(ticketId).populate("flight")

  if (!ticket)
    throw new NotFoundError()

  res.send(ticket.flight)
}