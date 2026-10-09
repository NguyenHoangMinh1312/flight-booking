import express, { Request, Response } from "express"
import { NotFoundError } from "@mint1312-flight-booking/common"
import { Ticket } from "../models/ticket"
import { Flight } from "../models/flight"

const router = express.Router()

router.get(
  "/api/flights/:id",
  async (req: Request, res: Response) => {
    // find the flight
    const flight = await Flight.findById(req.params.id)

    if (!flight)
      throw new NotFoundError()

    // find all associated tickets
    const tickets = await Ticket.find({ flight: flight._id })

    res.send({ flight, tickets })
  }
)

export { router as showFlightRouter }