import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { UserRole } from "@mint1312-flight-booking/common"

it(
  "Returns 404 if the flight is not found",
  async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
      .get(`/api/flights/${id}`)
      .send()
      .expect(404)
  }
)

it(
  "Returns the flight and its ticket if the flight is found",
  async () => {
    // create a flight first
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

    // check the ticket in the database
    const getFlightRes = await request(app)
      .get(`/api/flights/${createFlightRes.body.id}`)
      .send()
      .expect(200)

    expect(getFlightRes.body.flight.id).toEqual(createFlightRes.body.id)
    expect(getFlightRes.body.flight.flightNumber).toEqual("VN123")
    expect(getFlightRes.body.flight.description).toEqual(
      "Hanoi to Ho Chi Minh City"
    )
    expect(getFlightRes.body.flight.departure.airport).toEqual("HAN")
    expect(getFlightRes.body.flight.arrival.airport).toEqual("SGN")
    expect(getFlightRes.body.flight.seatConfig.rows).toEqual(2)
    expect(getFlightRes.body.flight.seatConfig.columns).toEqual(2)
    expect(getFlightRes.body.flight.seatConfig.classes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          class: "economy",
          fromRow: 1,
          toRow: 2
        })
      ])
    )
    expect(getFlightRes.body.flight.priceConfig).toEqual({
      first: 100,
      business: 50,
      economy: 10
    })

    expect(getFlightRes.body.tickets).toHaveLength(4)
    expect(
      getFlightRes.body.tickets.every(
        (ticket: { flight: string }) =>
          ticket.flight === createFlightRes.body.id
      )
    ).toBe(true)
    expect(
      getFlightRes.body.tickets.every(
        (ticket: { price: number }) => ticket.price === 10
      )
    ).toBe(true)
    expect(
      getFlightRes.body.tickets.every(
        (ticket: { class: string }) => ticket.class === "economy"
      )
    ).toBe(true)
    expect(getFlightRes.body.tickets.map((ticket: any) => ticket.seat)).toEqual(
      expect.arrayContaining([
        { row: 1, column: 1 },
        { row: 1, column: 2 },
        { row: 2, column: 1 },
        { row: 2, column: 2 }
      ])
    )

  }
)
