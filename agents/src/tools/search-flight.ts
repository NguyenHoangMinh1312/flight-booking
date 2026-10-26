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
        .string()
        .optional()
        .describe("Flight status filter (e.g., 'Available', 'Canceled'). Defaults to 'Available'"),
      maxPrice: z
        .number()
        .optional()
        .describe("Maximum economy class price to filter flights"),
    }),
  execute:
    async ({
      departureAirport,
      arrivalAirport,
      departureDate,
      flightNumber,
      status,
      maxPrice,
    }) => {
      try {
        const url = new URL(`${process.env.FLIGHTS_SRV_URL}/api/flights`)

        if (departureAirport) {
          url.searchParams.set("departureAirport", departureAirport)
        }
        if (arrivalAirport) {
          url.searchParams.set("arrivalAirport", arrivalAirport)
        }
        if (departureDate) {
          url.searchParams.set("departureDate", departureDate)
        }
        if (flightNumber) {
          url.searchParams.set("flightNumber", flightNumber)
        }
        if (status) {
          url.searchParams.set("status", status)
        }
        if (maxPrice !== undefined) {
          url.searchParams.set("maxPrice", maxPrice.toString())
        }

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
