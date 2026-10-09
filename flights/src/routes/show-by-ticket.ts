import express, { Request, Response } from "express"
import { Ticket } from "../models/ticket"
import { NotFoundError } from "@mint1312-flight-booking/common"

const router = express.Router()

router.get(
  "/api/flights/tickets/:ticketId",
  async (req: Request, res: Response) => {
    const { ticketId } = req.params

    const ticket = await Ticket.findById(ticketId).populate("flight")

    if (!ticket)
      throw new NotFoundError()

    res.send(ticket.flight)
  }
)

export { router as showByTicketRouter }