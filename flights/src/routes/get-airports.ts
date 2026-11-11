import express from "express"
import { getAirportsController } from "../controllers/get-airports-controller"

const router = express.Router()

router.get(
  "/api/flights/airports",
  getAirportsController
)

export { router as getAirportsRouter }