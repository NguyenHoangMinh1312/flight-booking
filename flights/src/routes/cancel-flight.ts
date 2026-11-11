import express from "express"
import { requireAuth, requireManager } from "@mint1312-flight-booking/common"
import { cancelFlightController } from "../controllers/cancel-flight-controller"

const router = express.Router()

router.delete(
  "/api/flights/:id",
  requireAuth,
  requireManager,
  cancelFlightController
)

export { router as cancelFlightRouter }