import { Request, Response } from "express"
import { BadRequestError, FlightStatus } from "@mint1312-flight-booking/common"
import { searchFlights } from "../services/search-flights-service"

const parseOptionalString = (value: any, field: string) => {
  if (value === undefined)
    return undefined

  if (typeof value !== "string" || !value.trim())
    throw new BadRequestError(`Invalid ${field}`)

  return value.trim()
}

const parseFlightStatus = (value: any) => {
  const status = parseOptionalString(value, "flight status")

  if (status === undefined)
    return undefined

  if (!Object.values(FlightStatus).includes(status as FlightStatus))
    throw new BadRequestError("Invalid flight status")

  return status as FlightStatus
}

const parseOptionalNumber = (value: any, field: string) => {
  const rawValue = parseOptionalString(value, field)

  if (rawValue === undefined)
    return undefined

  const number = Number(rawValue)

  if (!Number.isFinite(number) || number < 0)
    throw new BadRequestError(`Invalid ${field}`)

  return number
}

export const searchFlightsController = async (
  req: Request,
  res: Response
) => {
  const {
    departureAirport,
    arrivalAirport,
    departureDate,
    flightNumber,
    status,
    maxPrice
  } = req.query

  const flights = await searchFlights(
    parseOptionalString(departureAirport, "departure airport"),
    parseOptionalString(arrivalAirport, "arrival airport"),
    parseOptionalString(departureDate, "departure date"),
    parseOptionalString(flightNumber, "flight number"),
    parseFlightStatus(status),
    parseOptionalNumber(maxPrice, "max price")
  )

  res.send(flights)
}