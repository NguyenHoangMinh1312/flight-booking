import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Ticket } from "../../models/ticket"
import { Order } from "../../models/order"
import { Outbox } from "../../models/outbox"
import { Subjects, FlightStatus, OrderStatus } from "@mint1312-flight-booking/common"
import { orderExpirationWorker } from "../../workers/order-expiration-worker"

const setup = async (
  departureDate: Date = new Date(Date.now() + 5 * 60 * 60 * 1000),
  status: FlightStatus = FlightStatus.Available
) => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    class: "business",
    status,
    seat: {
      row: 1,
      column: 1
    },
    departureDate,
    departureAirport: "HAN",
    arrivalAirport: "SGN"
  })
  await ticket.save()

  const user = global.signin()

  return { ticket, user }
}

it(
  "Returns 401 if the user is not authenticated",
  async () => {
    const { ticket } = await setup()

    await request(app)
      .post("/api/orders")
      .send({
        ticketId: ticket.id
      })
      .expect(401)
  }
)

it(
  "Returns 400 if ticketId is not provided",
  async () => {
    const { user } = await setup()

    await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({})
      .expect(400)
  }
)

it(
  "Returns an error if the ticket does not exist",
  async () => {
    const { user } = await setup()

    await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: new mongoose.Types.ObjectId().toHexString()
      })
      .expect(404)
  }
)

it(
  "Returns 400 if the flight associated with the ticket is canceled",
  async () => {
    const { ticket, user } = await setup(
      new Date(Date.now() + 5 * 60 * 60 * 1000),
      FlightStatus.Canceled
    )

    await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: ticket.id
      })
      .expect(400)
  }
)

it(
  "Returns 400 if the user orders a ticket less than 3 hours before departure",
  async () => {
    const { ticket, user } = await setup(new Date())

    await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: ticket.id
      })
      .expect(400)
  }
)

it(
  "Returns an error if the ticket is already reserved",
  async () => {
    const { ticket, user } = await setup()

    // order the ticket
    await request(app)
      .post("/api/orders")
      .set("Cookie", user)
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
  "Returns 201 if the ticket is reserved successfully",
  async () => {
    const { ticket, user } = await setup()

    // order the ticket
    const response = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    // check if the order is sent to expiration queue
    expect(orderExpirationWorker.add).toHaveBeenCalledTimes(1)

    // check if the ticket id in the response matches the ticket
    expect(response.body.ticket.id).toEqual(ticket.id)

    // check if the event is saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(1)
    expect(outboxEvents[0]?.eventType).toEqual(Subjects.OrderCreated)
  }
)

it(
  "Allows reserving a ticket if its previous order was canceled",
  async () => {
    const { ticket, user } = await setup()

    const firstOrderRes = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    await Order.findByIdAndUpdate(firstOrderRes.body.id, { status: OrderStatus.Canceled })

    const secondOrderRes = await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    expect(secondOrderRes.body.ticket.id).toEqual(ticket.id)
  }
)
