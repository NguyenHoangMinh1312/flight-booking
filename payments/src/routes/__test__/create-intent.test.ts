import request from "supertest"
import { app } from "../../app"
import mongoose from "mongoose"
import { Order } from "../../models/order"
import { OrderStatus } from "@mint1312-flight-booking/common"
import { stripe } from "../../stripe"

it("Returns 404 when order does not exist", async () => {
  await request(app)
    .post("/api/payments/create-intent")
    .set("Cookie", global.signin())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404)
})

it("Returns 401 when order does not belong to user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 1500000,
  })
  await order.save()

  await request(app)
    .post("/api/payments/create-intent")
    .set("Cookie", global.signin())
    .send({
      orderId: order.id,
    })
    .expect(401)
})

it("Returns 400 when order is canceled", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    status: OrderStatus.Canceled,
    price: 1500000,
  })
  await order.save()

  await request(app)
    .post("/api/payments/create-intent")
    .set("Cookie", global.signin(userId))
    .send({
      orderId: order.id,
    })
    .expect(400)
})

it("Returns 201 with clientSecret when creating payment intent successfully", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    status: OrderStatus.Created,
    price: 1500000,
  })
  await order.save()

  jest.mocked(stripe.paymentIntents.create).mockResolvedValue({
    id: "pi_test_123",
    client_secret: "pi_test_123_secret_xyz",
  } as any)

  const response = await request(app)
    .post("/api/payments/create-intent")
    .set("Cookie", global.signin(userId))
    .send({
      orderId: order.id,
    })
    .expect(201)

  expect(response.body.clientSecret).toEqual("pi_test_123_secret_xyz")
  expect(response.body.paymentIntentId).toEqual("pi_test_123")
  expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
    expect.objectContaining({
      amount: 1500000,
      currency: "vnd",
      metadata: expect.objectContaining({
        orderId: order.id,
      }),
    })
  )
})
