import { Request, Response } from "express"
import { FlightStatus } from "@mint1312-flight-booking/common"
import { searchFlights } from "../services/search-flights-service"

type ReqQuery = {
  departureAirport: string | undefined,
  arrivalAirport: string | undefined,
  departureDate: string | undefined,
  flightNumber: string | undefined,
  status: FlightStatus | undefined,
  maxPrice: number | undefined
}
export const searchFlightsController = async (
  req: Request<any, any, any, ReqQuery>,
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
    departureAirport,
    arrivalAirport,
    departureDate,
    flightNumber,
    status,
    maxPrice
  )

  res.send(flights)
}