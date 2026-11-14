import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Subjects, UserRole } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"
import { Ticket } from "../../models/ticket"

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
          toRow: 1,
          columns: 2,
          price: 5000000
        },
        {
          class: "business",
          fromRow: 2,
          toRow: 2,
          columns: 4,
          price: 3000000
        }
      ]
    })
    .expect(201)

  return createFlightRes.body
}

it("Returns 404 if the flight is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .put(`/api/flights/${id}`)
    .set("Cookie", global.signin(UserRole.Manager))
    .send({
      description: "Ho Chi Minh City to Hanoi",
      priceConfig: [
        {
          class: "economy",
          price: 500000
        }
      ]
    })
    .expect(404)
})

it("Returns 401 if user is not authenticated", async () => {
  const flight = await setup()

  await request(app)
    .put(`/api/flights/${flight.id}`)
    .send({})
    .expect(401)
})

it("Returns 403 if customers access", async () => {
  const flight = await setup()

  await request(app)
    .put(`/api/flights/${flight.id}`)
    .set("Cookie", global.signin(UserRole.Customer))
    .send({})
    .expect(403)
})

it("Returns 400 if invalid inputs are provided", async () => {
  const flight = await setup()

  // missing or empty priceConfig
  await request(app)
    .put(`/api/flights/${flight.id}`)
    .set("Cookie", global.signin(UserRole.Manager))
    .send({
      description: "Updated description",
      priceConfig: []
    })
    .expect(400)

  // invalid class name in priceConfig
  await request(app)
    .put(`/api/flights/${flight.id}`)
    .set("Cookie", global.signin(UserRole.Manager))
    .send({
      description: "Updated description",
      priceConfig: [
        {
          class: "invalid-class",
          price: 500000
        }
      ]
    })
    .expect(400)

  // non-positive price in priceConfig
  await request(app)
    .put(`/api/flights/${flight.id}`)
    .set("Cookie", global.signin(UserRole.Manager))
    .send({
      description: "Updated description",
      priceConfig: [
        {
          class: "first",
          price: -100
        }
      ]
    })
    .expect(400)

  // non-string description
  await request(app)
    .put(`/api/flights/${flight.id}`)
    .set("Cookie", global.signin(UserRole.Manager))
    .send({
      description: 12345,
      priceConfig: [
        {
          class: "first",
          price: 5000000
        }
      ]
    })
    .expect(400)
})

it("Returns 200 if manager updates the flight properly", async () => {
  const flight = await setup()

  const updateFlightRes = await request(app)
    .put(`/api/flights/${flight.id}`)
    .set("Cookie", global.signin(UserRole.Manager))
    .send({
      description: "Ho Chi Minh City to Hanoi",
      priceConfig: [
        {
          class: "first",
          price: 6000000
        },
        {
          class: "business",
          price: 3500000
        }
      ]
    })
    .expect(200)

  // check the updated data was persisted
  const getFlightRes = await request(app)
    .get(`/api/flights/${flight.id}`)
    .send()
    .expect(200)

  expect(getFlightRes.body.flight.description).toEqual(updateFlightRes.body.description)
  expect(getFlightRes.body.flight.classConfig).toEqual(updateFlightRes.body.classConfig)

  const firstTickets = getFlightRes.body.tickets.filter((t: any) => t.class === "first")
  const businessTickets = getFlightRes.body.tickets.filter((t: any) => t.class === "business")
  expect(firstTickets.every((t: any) => t.price === 6000000)).toBe(true)
  expect(businessTickets.every((t: any) => t.price === 3500000)).toBe(true)

  // expect the event to be saved to outbox
  const outboxEvents = await Outbox.find({})
  expect(outboxEvents).toBeDefined()
  expect(outboxEvents).toHaveLength(6 + 6)
  const updatedEvents = outboxEvents.filter((e) => e.eventType === Subjects.TicketUpdated)
  expect(updatedEvents).toHaveLength(6)
})

it("Only updates unreserved tickets and skips tickets with an orderId", async () => {
  const flight = await setup()

  const tickets = await Ticket.find({ flight: flight.id, class: "first" })
  const reservedTicket = tickets[0]!
  reservedTicket.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
  await reservedTicket.save()

  await request(app)
    .put(`/api/flights/${flight.id}`)
    .set("Cookie", global.signin(UserRole.Manager))
    .send({
      description: "Updated flight with reserved ticket",
      priceConfig: [
        {
          class: "first",
          price: 7000000
        },
        {
          class: "business",
          price: 4000000
        }
      ]
    })
    .expect(200)

  const unchangedReservedTicket = await Ticket.findById(reservedTicket.id)
  expect(unchangedReservedTicket!.price).toEqual(5000000)

  const unreservedFirstTicket = await Ticket.findOne({
    flight: flight.id,
    class: "first",
    _id: { $ne: reservedTicket._id }
  })
  expect(unreservedFirstTicket!.price).toEqual(7000000)

  // 6 TicketCreated events + 5 TicketUpdated events (for the 5 unreserved tickets)
  const outboxEvents = await Outbox.find({})
  expect(outboxEvents).toHaveLength(6 + 5)
})

