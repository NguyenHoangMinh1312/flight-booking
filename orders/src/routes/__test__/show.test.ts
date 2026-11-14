import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import mongoose from "mongoose"
import { FlightStatus, UserRole } from "@mint1312-flight-booking/common"

const setup = async () => {
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
    departureDate: new Date(Date.now() + 5 * 60 * 60 * 1000),
    departureAirport: "HAN",
    arrivalAirport: "SGN"
  })
  await ticket.save()

  const user = global.signin()
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id
    })
    .expect(201)

  return { ticket, user, order }
}

it(
  "Returns 401 if the user is not authenticated",
  async () => {
    const { order } = await setup()

    await request(app)
      .get(`/api/orders/${order.id}`)
      .expect(401)
  }
)

it(
  "Returns 404 if the order does not exist",
  async () => {
    const { user } = await setup()
    const nonExistentOrderId = new mongoose.Types.ObjectId().toHexString()

    await request(app)
      .get(`/api/orders/${nonExistentOrderId}`)
      .set("Cookie", user)
      .expect(404)
  }
)

it(
  "Returns 401 if a user tries to fetch orders of another user",
  async () => {
    const { order } = await setup()

    // Make request to fetch order from order id with a different user
    await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", global.signin())
      .expect(401)
  }
)

it(
  "Fetches order from an order id",
  async () => {
    const { ticket, user, order } = await setup()

    // Make request to fetch order from order id
    const response = await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .expect(200)

    expect(response.body.id).toEqual(order.id)
    expect(response.body.ticket.id).toEqual(ticket.id)
  }
)

it(
  "Allows a manager to fetch an order belonging to another user",
  async () => {
    const { ticket, order } = await setup()

    const response = await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", global.signin(UserRole.Manager))
      .expect(200)

    expect(response.body.id).toEqual(order.id)
    expect(response.body.ticket.id).toEqual(ticket.id)
  }
)
