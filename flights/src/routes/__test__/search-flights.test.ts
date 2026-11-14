import request from "supertest"
import { app } from "../../app"
import { Flight, FlightClass, FlightDoc } from "../../models/flight"
import { FlightStatus } from "@mint1312-flight-booking/common"

const setup = async (overrides: Record<string, any> = {}) => {
  const flight = Flight.build({
    flightNumber: "VN123",
    description: "Hanoi to Ho Chi Minh City",
    departure: {
      airport: "HAN",
      date: new Date("2026-09-04T10:00:00Z")
    },
    arrival: {
      airport: "SGN",
      date: new Date("2026-09-04T12:00:00Z")
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
    ],
    ...overrides
  })
  await flight.save()

  return flight
}

it("Return a list of flights", async () => {
  const flights = []
  const total = 10

  for (let i = 0; i < total; i++) {
    flights.push(setup())
  }

  await Promise.all(flights)

  const response = await request(app)
    .get("/api/flights")
    .expect(200)

  expect(response.body.total).toEqual(total)
  expect(response.body.flights).toHaveLength(total)
  expect(response.body.flights.every((item: FlightDoc) => item.flightNumber === "VN123")).toEqual(true)
})

it("Filters flights by flightNumber (case-insensitive)", async () => {
  await setup({ flightNumber: "VN123" })
  await setup({ flightNumber: "VJ456" })
  await setup({ flightNumber: "QH789" })

  const response = await request(app)
    .get("/api/flights")
    .query({ flightNumber: "vj456" })
    .expect(200)

  expect(response.body.total).toEqual(1)
  expect(response.body.flights).toHaveLength(1)
  expect(response.body.flights[0].flightNumber).toEqual("VJ456")
})

it("Filters flights by departureDate", async () => {
  await setup({
    flightNumber: "VN100",
    departure: { airport: "HAN", date: new Date("2026-09-01T10:00:00Z") }
  })
  await setup({
    flightNumber: "VN200",
    departure: { airport: "HAN", date: new Date("2026-09-05T10:00:00Z") }
  })

  const response = await request(app)
    .get("/api/flights")
    .query({ departureDate: "2026-09-04" })
    .expect(200)

  expect(response.body.total).toEqual(1)
  expect(response.body.flights).toHaveLength(1)
  expect(response.body.flights[0].flightNumber).toEqual("VN200")
})

it("Excludes canceled flights by default and filters by status when provided", async () => {
  await setup({ flightNumber: "VN100", status: FlightStatus.Available })
  await setup({ flightNumber: "VN200", status: FlightStatus.Canceled })

  // default status is Available
  const availableRes = await request(app)
    .get("/api/flights")
    .expect(200)

  expect(availableRes.body.total).toEqual(1)
  expect(availableRes.body.flights[0].flightNumber).toEqual("VN100")

  // explicit Canceled status
  const canceledRes = await request(app)
    .get("/api/flights")
    .query({ status: FlightStatus.Canceled })
    .expect(200)

  expect(canceledRes.body.total).toEqual(1)
  expect(canceledRes.body.flights[0].flightNumber).toEqual("VN200")
})

it("Filters flights by maxPrice", async () => {
  await setup({
    flightNumber: "VN100",
    classConfig: [
      {
        class: FlightClass.Economy,
        fromRow: 1,
        toRow: 2,
        columns: 2,
        price: 300000
      }
    ]
  })
  await setup({
    flightNumber: "VN200",
    classConfig: [
      {
        class: FlightClass.First,
        fromRow: 1,
        toRow: 2,
        columns: 2,
        price: 2000000
      }
    ]
  })

  const response = await request(app)
    .get("/api/flights")
    .query({ maxPrice: 500000 })
    .expect(200)

  expect(response.body.total).toEqual(1)
  expect(response.body.flights[0].flightNumber).toEqual("VN100")
})

it("Supports pagination via page and limit query parameters", async () => {
  for (let i = 1; i <= 5; i++) {
    await setup({
      flightNumber: `VN10${i}`,
      departure: {
        airport: "HAN",
        date: new Date(`2026-09-0${i}T10:00:00Z`)
      }
    })
  }

  const page1Res = await request(app)
    .get("/api/flights")
    .query({ page: 1, limit: 2 })
    .expect(200)

  expect(page1Res.body.total).toEqual(5)
  expect(page1Res.body.flights).toHaveLength(2)
  // sorted by departure.date descending
  expect(page1Res.body.flights[0].flightNumber).toEqual("VN105")
  expect(page1Res.body.flights[1].flightNumber).toEqual("VN104")

  const page3Res = await request(app)
    .get("/api/flights")
    .query({ page: 3, limit: 2 })
    .expect(200)

  expect(page3Res.body.total).toEqual(5)
  expect(page3Res.body.flights).toHaveLength(1)
  expect(page3Res.body.flights[0].flightNumber).toEqual("VN101")
})

it("Returns empty list when no flights match search criteria", async () => {
  await setup({ flightNumber: "VN123" })

  const response = await request(app)
    .get("/api/flights")
    .query({ flightNumber: "NONEXISTENT" })
    .expect(200)

  expect(response.body.total).toEqual(0)
  expect(response.body.flights).toEqual([])
})
