import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Order } from "../../models/order"
import { OrderStatus, UserRole } from "@mint1312-flight-booking/common"
import { stripeClient } from "../../services/payment-clients/stripe-client"

const setup = async (
  status: OrderStatus = OrderStatus.Created,
  userId: string = new mongoose.Types.ObjectId().toHexString()
) => {
  jest.clearAllMocks()

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    status,
    price: 1500000,
  })
  await order.save()

  return { order, userId }
}

it("Returns 401 when user is not authenticated", async () => {
  await request(app)
    .post("/api/payments")
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(401)
})

it("Returns 400 when orderId is not provided or empty", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(UserRole.Customer))
    .send({})
    .expect(400)

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(UserRole.Customer))
    .send({ orderId: "" })
    .expect(400)
})

it("Returns 404 when order does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(UserRole.Customer))
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404)
})

it("Returns 401 when order does not belong to user", async () => {
  const { order } = await setup()

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(UserRole.Customer))
    .send({
      orderId: order.id,
    })
    .expect(401)
})

it("Returns 400 when order is canceled", async () => {
  const { order, userId } = await setup(OrderStatus.Canceled)

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(UserRole.Customer, userId))
    .send({
      orderId: order.id,
    })
    .expect(400)
})

it("Returns 400 when order is already complete", async () => {
  const { order, userId } = await setup(OrderStatus.Complete)

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(UserRole.Customer, userId))
    .send({
      orderId: order.id,
    })
    .expect(400)
})

it("Returns 201 with clientSecret when creating payment intent successfully", async () => {
  const { order, userId } = await setup()

  jest.mocked(stripeClient.pay).mockResolvedValue({
    id: "pi_test_123",
    client_secret: "pi_test_123_secret_xyz",
  } as any)

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(UserRole.Customer, userId))
    .send({
      orderId: order.id,
    })
    .expect(201)

  expect(response.body.clientSecret).toEqual("pi_test_123_secret_xyz")
  expect(response.body.paymentIntentId).toEqual("pi_test_123")
  expect(stripeClient.pay).toHaveBeenCalledWith(order.price, "vnd", order.id, { userId })
})
