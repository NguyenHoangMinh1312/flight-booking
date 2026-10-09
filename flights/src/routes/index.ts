import express, { Request, Response } from "express"
import { Flight, FlightDoc } from "../models/flight"
import { QueryFilter } from "mongoose"
import { FlightStatus } from "@mint1312-flight-booking/common"

const router = express.Router()

router.get(
  "/api/flights",
  async (req: Request, res: Response) => {
    const {
      departureAirport,
      arrivalAirport,
      departureDate,
      flightNumber,
      status,
      maxPrice
    } = req.query

    // build the search query
    const query: QueryFilter<FlightDoc> = {}

    if (flightNumber && typeof flightNumber === "string")
      query.flightNumber = { $regex: flightNumber.trim(), $options: "i" }

    if (departureAirport && typeof departureAirport === "string")
      query["departure.airport"] = { $regex: departureAirport.trim(), $options: "i" }

    if (arrivalAirport && typeof arrivalAirport === "string")
      query["arrival.airport"] = { $regex: arrivalAirport.trim(), $options: "i" }

    if (departureDate && typeof departureDate === "string") {
      const startOfDay = new Date(departureDate)
      startOfDay.setUTCHours(0, 0, 0, 0)

      if (!isNaN(startOfDay.getTime()))
        query["departure.date"] = { $gte: startOfDay }
    }

    if (status && typeof status === "string")
      query.status = status as FlightStatus
    else
      query.status = FlightStatus.Available

    if (maxPrice && !isNaN(Number(maxPrice)))
      query["priceConfig.economy?"] = { $lte: Number(maxPrice) }

    // filter by query
    const flights = await Flight.find(query).sort({ "departure.date": 1 })

    res.send(flights)
  }
)

export { router as indexFlightRouter }