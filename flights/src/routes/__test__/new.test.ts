import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import { FlightStatus, Subjects, UserRole } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"

const setup = (overrides: Record<string, any> = {}) => {
  return {
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
    ],
    ...overrides
  }
}

it("Return 401 when user is NOT signed in", async () => {
  await request(app)
    .post("/api/flights")
    .send(setup())
    .expect(401)
})

it("Return 403 when customers access", async () => {
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Customer))
    .send(setup())
    .expect(403)
})

it("Returns 400 when flightNumber is missing or empty", async () => {
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(setup({ flightNumber: "" }))
    .expect(400)
})

it("Returns 400 when departure or arrival dates are invalid", async () => {
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        departure: { airport: "HAN", date: "invalid-date" }
      })
    )
    .expect(400)

  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        arrival: { airport: "SGN", date: "invalid-date" }
      })
    )
    .expect(400)
})

it("Returns 400 when departure date is equal to or later than arrival date", async () => {
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        departure: { airport: "HAN", date: "2026-09-04T20:00:00" },
        arrival: { airport: "SGN", date: "2026-09-04T19:39:50" }
      })
    )
    .expect(400)
})

it("Returns 400 when departure or arrival airport code is invalid", async () => {
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        departure: { airport: "INVALID", date: "2026-09-04T17:39:50" }
      })
    )
    .expect(400)

  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        arrival: { airport: "INVALID", date: "2026-09-04T19:39:50" }
      })
    )
    .expect(400)
})

it("Returns 400 when rows or classConfig fields are invalid", async () => {
  // rows <= 0
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(setup({ rows: 0 }))
    .expect(400)

  // empty classConfig
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(setup({ classConfig: [] }))
    .expect(400)

  // invalid class name
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        classConfig: [
          { class: "vip", fromRow: 1, toRow: 2, columns: 2, price: 100000 }
        ]
      })
    )
    .expect(400)

  // columns out of range (1..26)
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        classConfig: [
          { class: "economy", fromRow: 1, toRow: 2, columns: 27, price: 100000 }
        ]
      })
    )
    .expect(400)

  // non-positive price
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        classConfig: [
          { class: "economy", fromRow: 1, toRow: 2, columns: 2, price: 0 }
        ]
      })
    )
    .expect(400)
})

it("Returns 400 when classConfig row ranges are invalid or overlap", async () => {
  // fromRow > toRow
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        rows: 3,
        classConfig: [
          { class: "first", fromRow: 2, toRow: 1, columns: 2, price: 5000000 }
        ]
      })
    )
    .expect(400)

  // toRow > rows
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        rows: 2,
        classConfig: [
          { class: "first", fromRow: 1, toRow: 3, columns: 2, price: 5000000 }
        ]
      })
    )
    .expect(400)

  // overlapping row ranges
  await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(
      setup({
        rows: 4,
        classConfig: [
          { class: "first", fromRow: 1, toRow: 2, columns: 2, price: 5000000 },
          { class: "business", fromRow: 2, toRow: 4, columns: 4, price: 3000000 }
        ]
      })
    )
    .expect(400)
})

it("Creates a flight if valid inputs", async () => {
  const response = await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(setup())
    .expect(201)

  expect(response.body.flightNumber).toEqual("VN123")
  expect(response.body.status).toEqual(FlightStatus.Available)

  // expect the ticket to be saved to MongoDB
  const tickets = await Ticket.find({}).populate("flight")
  expect(tickets).toBeDefined()
  expect(tickets).toHaveLength(6)
  expect(tickets.every((ticket) => ticket.flight.id === response.body.id)).toBe(true)

  // expect the event to be saved to outbox
  const outboxEvents = await Outbox.find({})
  expect(outboxEvents).toBeDefined()
  expect(outboxEvents).toHaveLength(6)
  expect(outboxEvents.every((event) => event.eventType === Subjects.TicketCreated)).toBe(true)
})

it("Creates a flight when optional description is omitted", async () => {
  const payload = setup()
  delete (payload as Record<string, any>).description

  const response = await request(app)
    .post("/api/flights")
    .set("Cookie", global.signin(UserRole.Manager))
    .send(payload)
    .expect(201)

  expect(response.body.flightNumber).toEqual("VN123")
  expect(response.body.description).toBeUndefined()
})

