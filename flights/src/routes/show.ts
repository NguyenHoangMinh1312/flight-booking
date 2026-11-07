import express from "express"
import { showFlightController } from "../controllers/show-flight-controller"

const router = express.Router()

router.get(
  "/api/flights/:id",
  showFlightController
)

export { router as showFlightRouter }