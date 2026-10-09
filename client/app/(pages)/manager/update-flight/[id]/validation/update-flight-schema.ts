import { z } from "zod";

export const updateFlightSchema = z.object({
  description: z.string()
    .trim()
    .min(1, "Description is required"),
  priceFirst: z.coerce
    .number()
    .positive("First class price must be positive"),
  priceBusiness: z.coerce
    .number()
    .positive("Business class price must be positive"),
  priceEconomy: z.coerce
    .number()
    .positive("Economy class price must be positive"),
});