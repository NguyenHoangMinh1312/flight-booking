import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { UserRole } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

it(
  "Returns 404 if the flight is not found",
  async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
      .put(`/api/flights/${id}`)
      .set("Cookie", global.signin(UserRole.Manager))
      .send({
        description: "Ho Chi Minh City to Hanoi",
        priceConfig: {
          first: 120,
          business: 60,
          economy: 15
        }
      })
      .expect(404)
  }
)

it(
  "Returns 401 if user is not authenticated",
  async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
      .put(`/api/flights/${id}`)
      .send({})
      .expect(401)
  }
)

it(
  "Returns 403 if customers access",
  async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
      .put(`/api/flights/${id}`)
      .set("Cookie", global.signin(UserRole.Customer))
      .send({})
      .expect(403)
  }
)

it(
  "Returns 200 if manager updates the flight properly",
  async () => {
    // first create a flight
    const createFlightRes = await request(app)
      .post("/api/flights")
      .set("Cookie", global.signin(UserRole.Manager))
      .send({
        flightNumber: "VN123",
        description: "Hanoi to Ho Chi Minh City",
        departure: {
          airport: "Noi Bai",
          date: "2026-09-04T17:39:50"
        },
        arrival: {
          airport: "Tan Son Nhat",
          date: "2026-09-04T19:39:50"
        },
        seatConfig: {
          rows: 3,
          columns: 2,
          classes: [
            {
              class: "economy",
              fromRow: 1,
              toRow: 1
            },
            {
              class: "business",
              fromRow: 2,
              toRow: 2
            },
            {
              class: "first",
              fromRow: 3,
              toRow: 3
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

    // update the flight
    const updateFlightRes = await request(app)
      .put(`/api/flights/${createFlightRes.body.id}`)
      .set("Cookie", global.signin(UserRole.Manager))
      .send({
        description: "Ho Chi Minh City to Hanoi",
        priceConfig: {
          first: 120,
          business: 60,
          economy: 10
        }
      })
      .expect(200)


    // check the updated data was persisted
    const getFlightRes = await request(app)
      .get(`/api/flights/${createFlightRes.body.id}`)
      .send()
      .expect(200)
    expect(getFlightRes.body.flight.description).toEqual(updateFlightRes.body.description)
    expect(getFlightRes.body.flight.priceConfig).toEqual(updateFlightRes.body.priceConfig)

    // expect the event to be saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(6 + 4)
  }
)
