import request from "supertest"
import { app } from "../../app"
import { Flight, FlightClass, FlightDoc } from "../../models/flight"

const buildFlight = async () => {
  const flight = Flight.build({
    flightNumber: "VN123",
    description: "Hanoi to Ho Chi Minh City",
    departure: {
      airport: "HAN",
      date: new Date()
    },
    arrival: {
      airport: "SGN",
      date: new Date()
    },
    rows: 2,
    classConfig: [
      {
        class: FlightClass.Economy,
        fromRow: 1,
        toRow: 2,
        columns: 2,
        price: 500000
      }
    ]
  })
  await flight.save()

  return flight
}

it(
  "Return a list of flights",
  async () => {
    // create flights
    const flights = []
    const total = 10

    for (let i = 0; i < total; i++)
      flights.push(buildFlight())

    await Promise.all(flights)

    // check the response
    const response = await request(app)
      .get(`/api/flights`)
      .expect(200)

    expect(response.body.total).toEqual(total)
    expect(response.body.flights).toHaveLength(total)
    expect(response.body.flights.every((item: FlightDoc) => item.flightNumber === "VN123")).toEqual(true)
  })