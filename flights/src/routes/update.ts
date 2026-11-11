import express from "express"
import { body } from "express-validator"
import { requireAuth, requireManager, validateRequest } from "@mint1312-flight-booking/common"
import { updateFlightController } from "../controllers/update-flight-controller"
import { FlightClass } from "../models/flight"

const router = express.Router()

// allow the manager to change priceConfig and description after creating a flight. Others changes are prohibitted
router.put(
  "/api/flights/:id",
  requireAuth,
  requireManager,
  [
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("priceConfig")
      .isArray({ min: 1 })
      .withMessage("Class configuration must be a non-empty array"),
    body("priceConfig.*.class")
      .isIn(Object.values(FlightClass))
      .withMessage("Class name must be 'first', 'business' or 'economy'."),
    body("priceConfig.*.price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number")
  ],
  validateRequest,
  updateFlightController
)

export { router as updateFlightRouter }
