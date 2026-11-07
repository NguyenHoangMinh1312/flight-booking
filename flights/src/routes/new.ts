import express from "express"
import { body } from "express-validator"
import { requireAuth, requireManager, validateRequest } from "@mint1312-flight-booking/common"
import { createFlightController } from "../controllers/create-flight-controller"

const router = express.Router()

router.post(
  "/api/flights",
  requireAuth,
  requireManager,
  [
    body("flightNumber")
      .isString()
      .notEmpty()
      .withMessage("Flight number is required"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("departure")
      .isObject()
      .withMessage("Departure is required"),
    body("departure.airport")
      .isString()
      .notEmpty()
      .withMessage("Departure airport is required"),
    body("departure.date")
      .isISO8601()
      .toDate()
      .withMessage("Departure date must be a valid date"),
    body("arrival")
      .isObject()
      .withMessage("Arrival is required"),
    body("arrival.airport")
      .isString()
      .notEmpty()
      .withMessage("Arrival airport is required"),
    body("arrival.date")
      .isISO8601()
      .toDate()
      .withMessage("Arrival date must be a valid date"),
    body("seatConfig")
      .isObject()
      .withMessage("Seat configuration is required"),
    body("seatConfig.rows")
      .isInt({ gt: 0 })
      .withMessage("Seat rows must be a positive integer"),
    body("seatConfig.columns")
      .isInt({ gt: 0, lt: 27 })
      .withMessage("Seat columns must be a positive integer between 1 and 26"),
    body("seatConfig.classes")
      .isArray({ min: 1 })
      .withMessage("Seat classes must be a non-empty array"),
    body("seatConfig.classes.*.class")
      .isIn(["first", "business", "economy"])
      .withMessage("Seat class must be first, business, or economy"),
    body("seatConfig.classes.*.fromRow")
      .isInt({ min: 1 })
      .withMessage("Starting row must be a positive integer"),
    body("seatConfig.classes.*.toRow")
      .isInt({ min: 1 })
      .withMessage("Ending row must be a positive integer"),
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
  createFlightController
)

export { router as createFlightRouter }
