import { FlightStatus } from "@mint1312-flight-booking/common"
import { tool } from "@openai/agents"
import { z } from "zod"

export const searchFlightTool = tool({
  name: "searchFlights",
  description:
    "Search for flights based on departure airport, arrival airport, departure date, flight number, status, or max price.",
  parameters:
    z.object({
      departureAirport: z
        .string()
        .optional()
        .describe("Departure airport code or name (e.g., 'SGN', 'HAN', 'JFK')"),
      arrivalAirport: z
        .string()
        .optional()
        .describe("Arrival airport code or name (e.g., 'DAD', 'LAX', 'LHR')"),
      departureDate: z
        .string()
        .optional()
        .describe("Departure date in YYYY-MM-DD or ISO 8601 format (e.g., '2026-10-15')"),
      flightNumber: z
        .string()
        .optional()
        .describe("Flight number (e.g., 'VN123')"),
      status: z
        .enum(Object.values(FlightStatus))
        .optional()
        .describe("Flight status filter ('Available' or 'Canceled'). Defaults to 'Available'"),
      maxPrice: z
        .number()
        .nonnegative()
        .optional()
        .describe("Filter flights that have at least one ticket class with a price lower than or equal to this value"),
      page: z
        .int()
        .positive()
        .optional()
        .describe("Page number for pagination (starts at 1)"),
      limit: z
        .int()
        .positive()
        .optional()
        .describe("Maximum number of flight results to return per page")
    }),
  execute:
    async ({
      departureAirport,
      arrivalAirport,
      departureDate,
      flightNumber,
      status,
      maxPrice,
      page,
      limit
    }) => {
      try {
        const url = new URL(`${process.env.FLIGHTS_SRV_URL}/api/flights`)

        if (departureAirport)
          url.searchParams.set("departureAirport", departureAirport)

        if (arrivalAirport)
          url.searchParams.set("arrivalAirport", arrivalAirport)

        if (departureDate)
          url.searchParams.set("departureDate", departureDate)

        if (flightNumber)
          url.searchParams.set("flightNumber", flightNumber)

        if (status)
          url.searchParams.set("status", status)

        if (maxPrice !== undefined)
          url.searchParams.set("maxPrice", maxPrice.toString())

        if (page !== undefined)
          url.searchParams.set("page", page.toString())

        if (limit !== undefined)
          url.searchParams.set("limit", limit.toString())

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => "")
          return {
            error: `Flights service responded with HTTP ${response.status}: ${errorText || response.statusText
              }`,
          }
        }

        const flights = await response.json()
        return flights
      } catch (err: any) {
        return {
          error: `Failed to query flights service: ${err.message || String(err)}`,
        }
      }
    },
})
