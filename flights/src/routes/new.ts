import express from "express"
import { body } from "express-validator"
import { requireAuth, requireManager, validateRequest } from "@mint1312-flight-booking/common"
import { createFlightController } from "../controllers/create-flight-controller"
import { FlightClass } from "../models/flight"

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
    body("rows")
      .isInt({ gt: 0 })
      .withMessage("Seat rows must be a positive integer"),
    body("classConfig")
      .isArray({ min: 1 })
      .withMessage("Class configuration must be a non-empty array"),
    body("classConfig.*.class")
      .isIn(Object.values(FlightClass))
      .withMessage("Class name must be 'first', 'business' or 'economy'."),
    body("classConfig.*.fromRow")
      .isInt({ gt: 0 })
      .withMessage("Starting row must be a positive integer"),
    body("classConfig.*.toRow")
      .isInt({ gt: 0 })
      .withMessage("Ending row must be a positive integer"),
    body("classConfig.*.columns")
      .isInt({ gt: 0, lt: 27 })
      .withMessage("Seat columns must be a positive integer between 1 and 26"),
    body("classConfig.*.price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number"),
  ],
  validateRequest,
  createFlightController
)

export { router as createFlightRouter }
