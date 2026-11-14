import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import { Order } from "../../models/order"
import mongoose from "mongoose"
import { FlightStatus, OrderStatus } from "@mint1312-flight-booking/common"

const setup = async () => {
  const createTicket = async () => {
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

  const ticket_1 = await createTicket()
  const ticket_2 = await createTicket()
  const ticket_3 = await createTicket()

  const user_1 = global.signin()
  const order_1 = await request(app)
    .post("/api/orders")
    .set("Cookie", user_1)
    .send({ ticketId: ticket_1.id })
    .expect(201)

  const user_2 = global.signin()
  const order_2 = await request(app)
    .post("/api/orders")
    .set("Cookie", user_2)
    .send({ ticketId: ticket_2.id })
    .expect(201)

  const order_3 = await request(app)
    .post("/api/orders")
    .set("Cookie", user_2)
    .send({ ticketId: ticket_3.id })
    .expect(201)

  return {
    user_1,
    user_2,
    order_1: order_1.body,
    order_2: order_2.body,
    order_3: order_3.body
  }
}

it(
  "Returns 401 if the user is not authenticated",
  async () => {
    await request(app)
      .get("/api/orders")
      .expect(401)
  }
)

it(
  "Returns an empty array if the user has no orders",
  async () => {
    await setup()

    const response = await request(app)
      .get("/api/orders")
      .set("Cookie", global.signin())
      .expect(200)

    expect(response.body.orders).toHaveLength(0)
    expect(response.body.total).toEqual(0)
  }
)

it(
  "Fetches orders for a particular user",
  async () => {
    const { user_2, order_2, order_3 } = await setup()

    // Make request to get orders from user 2
    const response = await request(app)
      .get(`/api/orders`)
      .set("Cookie", user_2)
      .expect(200)

    // Make sure we only get orders from user 2
    expect(response.body.orders).toHaveLength(2)
    expect(response.body.total).toEqual(2)
    expect(response.body.orders[0].id).toEqual(order_3.id)
    expect(response.body.orders[1].id).toEqual(order_2.id)
  }
)

it(
  "Filters a customer's orders by status",
  async () => {
    const { user_2, order_2 } = await setup()

    await Order.findByIdAndUpdate(order_2.id, { status: OrderStatus.Complete })

    const response = await request(app)
      .get(`/api/orders?status=${OrderStatus.Complete}`)
      .set("Cookie", user_2)
      .expect(200)

    expect(response.body.orders).toHaveLength(1)
    expect(response.body.total).toEqual(1)
    expect(response.body.orders[0].id).toEqual(order_2.id)
  }
)

it(
  "Filters a customer's orders by createdDate",
  async () => {
    const { user_2 } = await setup()
    const today = new Date().toISOString().split("T")[0]

    const todayResponse = await request(app)
      .get(`/api/orders?createdDate=${today}`)
      .set("Cookie", user_2)
      .expect(200)

    expect(todayResponse.body.orders).toHaveLength(2)
    expect(todayResponse.body.total).toEqual(2)

    const pastResponse = await request(app)
      .get(`/api/orders?createdDate=2000-01-01`)
      .set("Cookie", user_2)
      .expect(200)

    expect(pastResponse.body.orders).toHaveLength(0)
    expect(pastResponse.body.total).toEqual(0)
  }
)

it(
  "Paginates a customer's orders with page and limit",
  async () => {
    const { user_2, order_2, order_3 } = await setup()

    const page1 = await request(app)
      .get("/api/orders?page=1&limit=1")
      .set("Cookie", user_2)
      .expect(200)

    expect(page1.body.orders).toHaveLength(1)
    expect(page1.body.total).toEqual(2)
    expect(page1.body.orders[0].id).toEqual(order_3.id)

    const page2 = await request(app)
      .get("/api/orders?page=2&limit=1")
      .set("Cookie", user_2)
      .expect(200)

    expect(page2.body.orders).toHaveLength(1)
    expect(page2.body.total).toEqual(2)
    expect(page2.body.orders[0].id).toEqual(order_2.id)
  }
)
