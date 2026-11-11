import { z } from "zod";

const optionalPositiveNumber = (positiveMsg: string) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().positive(positiveMsg).optional()
  );

export const updateFlightSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  priceFirst: optionalPositiveNumber("First class price must be positive"),
  priceBusiness: optionalPositiveNumber("Business class price must be positive"),
  priceEconomy: optionalPositiveNumber("Economy class price must be positive"),
});
