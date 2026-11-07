import { FlightStatus } from "@mint1312-flight-booking/common";
import { QueryFilter } from "mongoose";
import { FlightDoc } from "../models/flight";
import { Flight } from "../models/flight";

export const searchFlights = async (
  departureAirport: string | undefined,
  arrivalAirport: string | undefined,
  departureDate: string | undefined,
  flightNumber: string | undefined,
  status: FlightStatus | undefined,
  maxPrice: number | undefined
) => {
  const query: QueryFilter<FlightDoc> = {}

  if (flightNumber)
    query.flightNumber = { $regex: flightNumber.trim(), $options: "i" }

  if (departureAirport)
    query["departure.airport"] = { $regex: departureAirport.trim(), $options: "i" }

  if (arrivalAirport)
    query["arrival.airport"] = { $regex: arrivalAirport.trim(), $options: "i" }

  if (departureDate) {
    const startOfDay = new Date(departureDate)
    startOfDay.setUTCHours(0, 0, 0, 0)

    if (!isNaN(startOfDay.getTime()))
      query["departure.date"] = { $gte: startOfDay }
  }

  if (status)
    query.status = status
  else
    query.status = FlightStatus.Available

  if (maxPrice)
    query["priceConfig.economy?"] = { $lte: Number(maxPrice) }

  // filter by query
  const flights = await Flight.find(query).sort({ "departure.date": 1 })

  return flights
}