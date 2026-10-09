import { z } from "zod";

export const createFlightSchema = z.object({
  flightNumber: z.string()
    .trim()
    .min(1, "Flight number is required"),
  description: z.string()
    .trim()
    .min(1, "Description is required"),
  departureAirport: z.string()
    .trim()
    .min(1, "Departure airport is required"),
  departureDate: z.string()
    .min(1, "Departure date is required"),
  arrivalAirport: z.string()
    .trim()
    .min(1, "Arrival airport is required"),
  arrivalDate: z.string()
    .min(1, "Arrival date is required"),
  rows: z.coerce.number()
    .positive("Rows must be a positive integer"),
  columns: z.coerce.number()
    .positive("Columns must be a positive integer")
    .max(26, "Columns must not exceed 26"),
  firstFromRow: z.coerce
    .number()
    .min(1, "First class start row is required"),
  firstToRow: z.coerce
    .number()
    .min(1, "First class end row is required"),
  businessFromRow: z.coerce
    .number()
    .min(1, "Business class start row is required"),
  businessToRow: z.coerce
    .number()
    .min(1, "Business class end row is required"),
  economyFromRow: z.coerce
    .number()
    .min(1, "Economy class start row is required"),
  economyToRow: z.coerce
    .number()
    .min(1, "Economy class end row is required"),
  priceFirst: z.coerce.number()
    .positive("First class price must be positive"),
  priceBusiness: z.coerce
    .number()
    .positive("Business class price must be positive"),
  priceEconomy: z.coerce
    .number()
    .positive("Economy class price must be positive"),
});