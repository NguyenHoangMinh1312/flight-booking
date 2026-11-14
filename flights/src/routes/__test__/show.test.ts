import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { UserRole } from "@mint1312-flight-booking/common"

const setup = async (overrides: Record<string, any> = {}) => {
  const createFlightRes = await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send({
      flightNumber: "VN123",
      description: "Hanoi to Ho Chi Minh City",
      departure: {
        airport: "HAN",
        date: "2026-09-04T17:39:50"
      },
      arrival: {
        airport: "SGN",
        date: "2026-09-04T19:39:50"
      },
      rows: 2,
      classConfig: [
        {
          class: "first",
          fromRow: 1,
          toRow: 2,
          columns: 2,
          price: 500000
        }
      ],
      ...overrides
    })
    .expect(201)

  return createFlightRes.body
}

it("Returns 404 if the flight is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .get(`/api/flights/${id}`)
    .send()
    .expect(404)
})

it("Returns the flight and its ticket if the flight is found", async () => {
  const createdFlight = await setup()

  const getFlightRes = await request(app)
    .get(`/api/flights/${createdFlight.id}`)
    .send()
    .expect(200)

  expect(getFlightRes.body.flight.id).toEqual(createdFlight.id)
  expect(getFlightRes.body.flight.flightNumber).toEqual("VN123")
  expect(getFlightRes.body.flight.description).toEqual("Hanoi to Ho Chi Minh City")
  expect(getFlightRes.body.flight.departure.airport).toMatchObject({
    code: "HAN",
    city: "Hanoi",
    country: "Vietnam"
  })
  expect(getFlightRes.body.flight.arrival.airport).toMatchObject({
    code: "SGN",
    city: "Ho Chi Minh City",
    country: "Vietnam"
  })
  expect(getFlightRes.body.flight.rows).toEqual(2)

  expect(getFlightRes.body.tickets).toHaveLength(4)
  expect(
    getFlightRes.body.tickets.every((ticket: any) => {
      return ticket.price === 500000 && ticket.class === "first"
    })
  ).toBe(true)
  expect(getFlightRes.body.tickets.map((ticket: any) => ticket.seat)).toEqual(
    expect.arrayContaining([
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 2, column: 1 },
      { row: 2, column: 2 }
    ])
  )
})

it("Returns all tickets across multiple seat classes for the flight", async () => {
  const createdFlight = await setup({
    rows: 3,
    classConfig: [
      {
        class: "first",
        fromRow: 1,
        toRow: 1,
        columns: 2,
        price: 5000000
      },
      {
        class: "business",
        fromRow: 2,
        toRow: 2,
        columns: 3,
        price: 3000000
      },
      {
        class: "economy",
        fromRow: 3,
        toRow: 3,
        columns: 4,
        price: 1000000
      }
    ]
  })

  const getFlightRes = await request(app)
    .get(`/api/flights/${createdFlight.id}`)
    .send()
    .expect(200)

  expect(getFlightRes.body.tickets).toHaveLength(2 + 3 + 4)
  expect(getFlightRes.body.tickets.filter((t: any) => t.class === "first")).toHaveLength(2)
  expect(getFlightRes.body.tickets.filter((t: any) => t.class === "business")).toHaveLength(3)
  expect(getFlightRes.body.tickets.filter((t: any) => t.class === "economy")).toHaveLength(4)
})

