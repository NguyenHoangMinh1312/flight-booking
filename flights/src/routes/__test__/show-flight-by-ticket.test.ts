import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { UserRole } from "@mint1312-flight-booking/common"

const setup = async () => {
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
          price: 5000000
        }
      ]
    })
    .expect(201)

  const flightDetails = await request(app)
    .get(`/api/flights/${createFlightRes.body.id}`)
    .send()
    .expect(200)

  return {
    flight: flightDetails.body.flight,
    tickets: flightDetails.body.tickets
  }
}

it("Returns 404 if ticket is not found", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .get(`/api/flights/tickets/${ticketId}`)
    .send()
    .expect(404)
})

it("Returns the flight with populated airports if ticket is found", async () => {
  const { flight, tickets } = await setup()
  const ticketId = tickets[0].id

  const res = await request(app)
    .get(`/api/flights/tickets/${ticketId}`)
    .send()
    .expect(200)

  expect(res.body.id).toEqual(flight.id)
  expect(res.body.flightNumber).toEqual("VN123")
  expect(res.body.departure.airport).toMatchObject({
    code: "HAN",
    city: "Hanoi",
    country: "Vietnam"
  })
  expect(res.body.arrival.airport).toMatchObject({
    code: "SGN",
    city: "Ho Chi Minh City",
    country: "Vietnam"
  })
})

it("Returns the same flight for different tickets belonging to the same flight", async () => {
  const { flight, tickets } = await setup()

  const firstRes = await request(app)
    .get(`/api/flights/tickets/${tickets[0].id}`)
    .send()
    .expect(200)

  const secondRes = await request(app)
    .get(`/api/flights/tickets/${tickets[1].id}`)
    .send()
    .expect(200)

  expect(firstRes.body.id).toEqual(flight.id)
  expect(secondRes.body.id).toEqual(flight.id)
  expect(firstRes.body).toEqual(secondRes.body)
})

