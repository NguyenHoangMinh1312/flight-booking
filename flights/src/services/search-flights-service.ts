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
  maxPrice: number | undefined,
  page: number,
  limit: number
) => {
  const query: QueryFilter<FlightDoc> = {}

  if (flightNumber)
    query.flightNumber = { $regex: flightNumber.trim(), $options: "i" }

  if (departureAirport)
    query["departure.airport.code"] = { $regex: departureAirport.trim(), $options: "i" }

  if (arrivalAirport)
    query["arrival.airport.code"] = { $regex: arrivalAirport.trim(), $options: "i" }

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
    query["classConfig.price"] = { $lte: Number(maxPrice) }

  // fetch flights in the page scope
  limit = Math.max(0, limit)
  const skip = (page - 1) * limit

  const [flights, total] = await Promise.all([
    Flight.find(query)
      .populate([
        {
          path: "arrival.airport",
          foreignField: "code"
        },
        {
          path: "departure.airport",
          foreignField: "code"
        }
      ])
      .sort({ "departure.date": -1 })
      .skip(skip)
      .limit(limit)
    ,
    Flight.countDocuments(query)
  ])

  return { flights, total }
}