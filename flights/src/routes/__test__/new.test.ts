import request from "supertest"
import { app } from "../../app"
import { Flight } from "../../models/flight"
import { Ticket } from "../../models/ticket"
import { natsWrapper } from "../../nats-wrapper"
import { Subjects, UserRole } from "@mint1312-flight-booking/common"
import { jest } from "@jest/globals"
import { Outbox } from "../../models/outbox"

it(
  "Return 401 when user is NOT signed in",
  async () => {
    await request(app)
      .post("/api/flights")
      .send({})
      .expect(401)
  }
)

it(
  "Return 403 when customers access",
  async () => {
    await request(app)
      .post("/api/flights")
      .set("Cookie", global.signin(UserRole.Customer))
      .send({})
      .expect(403)
  }
)

it(
  "Returns 400 when invalid input is provided",
  async () => {
    await request(app)
      .post("/api/flights")
      .set("Cookie", global.signin(UserRole.Manager))
      .send({
        flightNumber: "",
        description: "",
        departure: {
          airport: "Noi Bai",
          date: "2026-09-04T17:39:50"
        }
      })
      .expect(400)
  }
)

it(
  "Creates a flight if valid inputs",
  async () => {
    const response = await request(app)
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

    expect(response.body.flightNumber).toEqual("VN123")

    // expect the ticket to be saved to MongoDB
    const tickets = await Ticket.find({}).populate("flight")
    expect(tickets).toBeDefined()
    expect(tickets).toHaveLength(4)
    expect(tickets.every((ticket) => ticket.flight.id === response.body.id)).toBe(true)
    expect(tickets.every((ticket) => ticket.price === 10)).toBe(true)
    expect(tickets.every((ticket) => ticket.class === "economy")).toBe(true)

    // expect the event to be saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(4)
    expect(outboxEvents.every((event) => event.eventType === Subjects.TicketCreated)).toBe(true)
    expect(outboxEvents.every((event) => event.payload.price === 10)).toBe(true)
    expect(outboxEvents.every((event) => event.payload.class === "economy")).toBe(true)
  }
)


