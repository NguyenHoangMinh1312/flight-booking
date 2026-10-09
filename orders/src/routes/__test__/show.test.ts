import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import mongoose from "mongoose"
import { FlightStatus } from "@mint1312-flight-booking/common"

const buildTicket = async () => {
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
    departureDate: new Date(Date.now() + 5 * 60 * 60 * 1000)
  })
  await ticket.save()

  return ticket
}

it(
  "Fetches order from an order id",
  async () => {
    // Create a ticket
    const ticket = await buildTicket()

    // Create order 
    const user = global.signin()
    const order = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    // Make request to fetch order from order id
    const response = await request(app)
      .get(`/api/orders/${order.body.id}`)
      .set("Cookie", user)
      .expect(200)

    expect(response.body.ticket.id).toEqual(ticket.id)
  }
)

it(
  "Returns 401 if a user tries to fetch orders of another user",
  async () => {
    // Create a ticket
    const ticket = await buildTicket()

    // Create order 
    const order = await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    // Make request to fetch order from order id
    await request(app)
      .get(`/api/orders/${order.body.id}`)
      .set("Cookie", global.signin())
      .expect(401)
  }
)