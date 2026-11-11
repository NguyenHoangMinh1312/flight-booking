import { z } from "zod";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().optional()
);

export const createFlightSchema = z.object({
  flightNumber: z.string(),
  description: z.string(),
  departureAirport: z.string(),
  departureDate: z.string(),
  arrivalAirport: z.string(),
  arrivalDate: z.string(),
  rows: z.coerce.number(),

  firstFromRow: optionalNumber,
  firstToRow: optionalNumber,
  firstColumns: optionalNumber,
  firstPrice: optionalNumber,

  businessFromRow: optionalNumber,
  businessToRow: optionalNumber,
  businessColumns: optionalNumber,
  businessPrice: optionalNumber,

  economyFromRow: optionalNumber,
  economyToRow: optionalNumber,
  economyColumns: optionalNumber,
  economyPrice: optionalNumber

});
