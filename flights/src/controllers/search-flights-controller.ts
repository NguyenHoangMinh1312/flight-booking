import { Request, Response } from "express"
import { FlightStatus } from "@mint1312-flight-booking/common"
import { searchFlights } from "../services/search-flights-service"

type ReqQuery = {
  departureAirport: string | undefined,
  arrivalAirport: string | undefined,
  departureDate: string | undefined,
  flightNumber: string | undefined,
  status: FlightStatus | undefined,
  maxPrice: string | undefined,
  page: string | undefined,
  limit: string | undefined
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
    maxPrice,
    page,
    limit
  } = req.query

  const { flights, total } = await searchFlights(
    departureAirport,
    arrivalAirport,
    departureDate,
    flightNumber,
    status,
    Number(maxPrice) || 0,
    Number(page) || 1,
    Number(limit) || 10
  )

  res.send({ flights, total })
}