import request from "supertest"
import { app } from "../../app"
import { Flight, FlightClass } from "../../models/flight"

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
    seatConfig: {
      rows: 2,
      columns: 2,
      classes: [
        {
          class: FlightClass.Economy,
          fromRow: 1,
          toRow: 2
        }
      ]
    },
    priceConfig: {
      "first": 1000000,
      "business": 500000,
      "economy": 200000
    }
  })
  await flight.save()

  return flight
}

it(
  "Return a list of flights",
  async () => {
    // create a flight
    const flight = await buildFlight()

    // check the response
    await request(app)
      .get("/api/flights")
      .expect(200)
  })