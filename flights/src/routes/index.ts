import express from "express"
import { searchFlightsController } from "../controllers/search-flights-controller"

const router = express.Router()

router.get(
  "/api/flights",
  searchFlightsController
)

export { router as indexFlightRouter }