import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import mongoose from "mongoose"
import { FlightStatus, UserRole } from "@mint1312-flight-booking/common"

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
    departureDate: new Date(Date.now() + 5 * 60 * 60 * 1000),
    departureAirport: "HAN",
    arrivalAirport: "SGN"
  })
  await ticket.save()

  return ticket
}

it(
  "Fetches orders for a particular user",
  async () => {
    // Create 3 tickets
    const ticket = await buildTicket()

    // Create 1 order as user 1
    const newOrderResponse = await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId: ticket.id
      })
      .expect(201)

    // Make request to get order from manager
    const response = await request(app)
      .get(`/api/manager/orders?orderId=${newOrderResponse.body.orderId}`)
      .set("Cookie", global.signin(UserRole.Manager))
      .expect(200)

    // Make sure we only get orders from user 2
    expect(response.body.orders).toHaveLength(1)
    expect(response.body.total).toEqual(1)
    expect(response.body.orders[0].id).toEqual(newOrderResponse.body.id)
  }
)