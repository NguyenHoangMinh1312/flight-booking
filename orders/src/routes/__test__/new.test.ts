import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Ticket } from "../../models/ticket"
import { Outbox } from "../../models/outbox"
import { Subjects, FlightStatus } from "@mint1312-flight-booking/common"
import { expirationQueue } from "../../queues/expiration-queue"

const buildTicket = async (departureDate?: Date) => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    class: "business",
    status: FlightStatus.Available,
    seat: {
      row: 1,
      column: 1
    },
    departureDate: departureDate || new Date()
  })
  await ticket.save()

  return ticket
}

it(
  "Returns an error if the tickets does not exists",
  async () => {
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: new mongoose.Types.ObjectId()
      })
      .expect(404)
  }
)

it(
  "Return 404 if the user order a ticket late",
  async () => {
    // create a new ticket
    const ticket = await buildTicket()

    // order the ticket
    const response = await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: ticket.id
      })
      .expect(400)
  }
)

it(
  "Returns an error if the tickets is already reserved",
  async () => {
    // create a new ticket
    const ticket = await buildTicket(new Date(Date.now() + 5 * 60 * 60 * 1000))

    // order the ticket
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    // re-order the ticket
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: ticket.id
      })
      .expect(400)
  }
)

it(
  "Returns 201 if the tickets is reserved successfully",
  async () => {
    // create a new ticket
    const ticket = await buildTicket(new Date(Date.now() + 5 * 60 * 60 * 1000))

    // order the ticket
    const response = await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    // check if the order is sent to expiration queue
    expect(expirationQueue.add).toHaveBeenCalledTimes(1)

    // check if the ticket id in the response match the ticket
    expect(response.body.ticket.id).toEqual(ticket.id)

    // check if the event is saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(1)
    expect(outboxEvents[0]?.eventType).toEqual(Subjects.OrderCreated)
  }
)


