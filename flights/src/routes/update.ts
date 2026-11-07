import express from "express"
import { body } from "express-validator"
import { requireAuth, requireManager, validateRequest } from "@mint1312-flight-booking/common"
import { updateFlightController } from "../controllers/update-flight-controller"

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
      .isObject()
      .withMessage("Price configuration is required"),
    body("priceConfig.first")
      .isFloat({ gt: 0 })
      .withMessage("First-class price must be positive"),
    body("priceConfig.business")
      .isFloat({ gt: 0 })
      .withMessage("Business-class price must be positive"),
    body("priceConfig.economy")
      .isFloat({ gt: 0 })
      .withMessage("Economy-class price must be positive")
  ],
  validateRequest,
  updateFlightController
)

export { router as updateFlightRouter }
