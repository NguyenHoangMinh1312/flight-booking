import express from "express"
import { showFlightByTicketController } from "../controllers/show-flight-by-ticket-controller"

const router = express.Router()

router.get(
  "/api/flights/tickets/:ticketId",
  showFlightByTicketController
)

export { router as showByTicketRouter }