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
  "Fetches orders for a particular user",
  async () => {
    // Create 3 tickets
    const ticket_1 = await buildTicket()
    const ticket_2 = await buildTicket()
    const ticket_3 = await buildTicket()

    // Create 1 order as user 1
    const user_1 = global.signin()
    const order_1 = await request(app)
      .post("/api/orders")
      .set("Cookie", user_1)
      .send({
        ticketId: ticket_1.id
      })
      .expect(201)

    // Create 2 orders as user 2
    const user_2 = global.signin()
    const order_2 = await request(app)
      .post("/api/orders")
      .set("Cookie", user_2)
      .send({
        ticketId: ticket_2.id
      })
      .expect(201)

    const order_3 = await request(app)
      .post("/api/orders")
      .set("Cookie", user_2)
      .send({
        ticketId: ticket_3.id
      })
      .expect(201)

    // Make request to get order from user 2
    const response = await request(app)
      .get("/api/orders")
      .set("Cookie", user_2)
      .expect(200)

    // Make sure we only get orders from user 2
    expect(response.body.length).toEqual(2)
    expect(response.body[0].id).toEqual(order_3.body.id)
    expect(response.body[1].id).toEqual(order_2.body.id)
    console.log(response.body[0])
  }
)