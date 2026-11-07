import express from "express"
import { showByTicketController } from "../controllers/show-by-ticket-controller"

const router = express.Router()

router.get(
  "/api/flights/tickets/:ticketId",
  showByTicketController
)

export { router as showByTicketRouter }