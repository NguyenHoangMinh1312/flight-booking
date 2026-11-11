import { z } from "zod";

const optionalPositiveNumber = (positiveMsg: string) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().positive(positiveMsg).optional()
  );

export const updateFlightSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  firstPrice: optionalPositiveNumber("First class price must be positive"),
  businessPrice: optionalPositiveNumber("Business class price must be positive"),
  economyPrice: optionalPositiveNumber("Economy class price must be positive"),
});
