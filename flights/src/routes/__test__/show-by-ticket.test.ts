import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { UserRole } from "@mint1312-flight-booking/common"

it("Returns 404 if ticket is not found", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .get(`/api/flights/tickets/${ticketId}`)
    .send()
    .expect(404)
})

it("Returns the flight if ticket is found", async () => {
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
      seatConfig: {
        rows: 2,
        columns: 2,
        classes: [
          {
            class: "economy",
            fromRow: 1,
            toRow: 2
          }
        ]
      },
      priceConfig: {
        first: 100,
        business: 50,
        economy: 10
      }
    })
    .expect(201)

  const flightDetails = await request(app)
    .get(`/api/flights/${createFlightRes.body.id}`)
    .send()
    .expect(200)

  const ticketId = flightDetails.body.tickets[0].id

  const res = await request(app)
    .get(`/api/flights/tickets/${ticketId}`)
    .send()
    .expect(200)

  expect(res.body.flightNumber).toEqual("VN123")
})
