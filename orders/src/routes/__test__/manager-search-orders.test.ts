import request from "supertest"
import { app } from "../../app"
import { Ticket } from "../../models/ticket"
import { Order } from "../../models/order"
import mongoose from "mongoose"
import { FlightStatus, OrderStatus, UserRole } from "@mint1312-flight-booking/common"

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

  const manager = global.signin(UserRole.Manager)

  return {
    manager,
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
      .get("/api/orders/all")
      .expect(401)
  }
)

it(
  "Returns 403 if the user is not a manager",
  async () => {
    const { user_1 } = await setup()

    await request(app)
      .get("/api/orders/all")
      .set("Cookie", user_1)
      .expect(403)
  }
)

it(
  "Fetches all orders across all users when requested by a manager",
  async () => {
    const { manager } = await setup()

    const response = await request(app)
      .get("/api/orders/all")
      .set("Cookie", manager)
      .expect(200)

    expect(response.body.orders).toHaveLength(3)
    expect(response.body.total).toEqual(3)
  }
)

it(
  "Fetches orders for a particular user when filtered by userId",
  async () => {
    const { manager, order_1 } = await setup()

    const response = await request(app)
      .get(`/api/orders/all?userId=${order_1.userId}`)
      .set("Cookie", manager)
      .expect(200)

    expect(response.body.orders).toHaveLength(1)
    expect(response.body.total).toEqual(1)
    expect(response.body.orders[0].id).toEqual(order_1.id)
  }
)

it(
  "Filters orders by status for a manager",
  async () => {
    const { manager, order_2 } = await setup()

    await Order.findByIdAndUpdate(order_2.id, { status: OrderStatus.Complete })

    const response = await request(app)
      .get(`/api/orders/all?status=${OrderStatus.Complete}`)
      .set("Cookie", manager)
      .expect(200)

    expect(response.body.orders).toHaveLength(1)
    expect(response.body.total).toEqual(1)
    expect(response.body.orders[0].id).toEqual(order_2.id)
  }
)

it(
  "Filters orders by createdDate for a manager",
  async () => {
    const { manager } = await setup()
    const today = new Date().toISOString().split("T")[0]

    const todayResponse = await request(app)
      .get(`/api/orders/all?createdDate=${today}`)
      .set("Cookie", manager)
      .expect(200)

    expect(todayResponse.body.orders).toHaveLength(3)
    expect(todayResponse.body.total).toEqual(3)

    const pastResponse = await request(app)
      .get("/api/orders/all?createdDate=2000-01-01")
      .set("Cookie", manager)
      .expect(200)

    expect(pastResponse.body.orders).toHaveLength(0)
    expect(pastResponse.body.total).toEqual(0)
  }
)

it(
  "Supports pagination with page and limit for a manager",
  async () => {
    const { manager } = await setup()

    const page1 = await request(app)
      .get("/api/orders/all?page=1&limit=2")
      .set("Cookie", manager)
      .expect(200)

    expect(page1.body.orders).toHaveLength(2)
    expect(page1.body.total).toEqual(3)

    const page2 = await request(app)
      .get("/api/orders/all?page=2&limit=2")
      .set("Cookie", manager)
      .expect(200)

    expect(page2.body.orders).toHaveLength(1)
    expect(page2.body.total).toEqual(3)
  }
)
