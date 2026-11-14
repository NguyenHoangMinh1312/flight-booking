import request from "supertest"
import { app } from "../../app"
import { Order } from "../../models/order"
import { Payment, PaymentProvider } from "../../models/payment"
import mongoose from "mongoose"
import { OrderStatus, UserRole } from "@mint1312-flight-booking/common"

const setup = async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    status: OrderStatus.Complete,
    price: 1500000,
  })
  await order.save()

  const payment = Payment.build({
    order,
    provider: PaymentProvider.Stripe,
    transactionId: "pi_test_123"
  })
  await payment.save()

  return { userId, order, payment }
}

it(
  "Returns 401 when user is not authenticated",
  async () => {
    await request(app)
      .get(`/api/payments/${new mongoose.Types.ObjectId().toHexString()}`)
      .expect(401)
  }
)

it(
  "Returns 404 when order does not exist",
  async () => {
    await request(app)
      .get(`/api/payments/${new mongoose.Types.ObjectId().toHexString()}`)
      .set("Cookie", global.signin(UserRole.Customer))
      .expect(404)
  }
)

it(
  "Returns 404 when order exists but payment does not exist",
  async () => {
    const { order, userId } = await setup()
    await Payment.deleteMany({})

    await request(app)
      .get(`/api/payments/${order.id}`)
      .set("Cookie", global.signin(UserRole.Customer, userId))
      .expect(404)
  }
)

it(
  "Returns 401 when order does not belong to user",
  async () => {
    const { order } = await setup()

    await request(app)
      .get(`/api/payments/${order.id}`)
      .set("Cookie", global.signin(UserRole.Customer))
      .expect(401)
  }
)

it(
  "Returns 200 when order belongs to user",
  async () => {
    const { userId, order, payment } = await setup()

    const response = await request(app)
      .get(`/api/payments/${order.id}`)
      .set("Cookie", global.signin(UserRole.Customer, userId))
      .expect(200)

    expect(response.body.provider).toEqual(payment.provider)
    expect(response.body.transactionId).toEqual(payment.transactionId)
  }
)

it(
  "Returns 200 when a manager requests payment for another user's order",
  async () => {
    const { order, payment } = await setup()

    const response = await request(app)
      .get(`/api/payments/${order.id}`)
      .set("Cookie", global.signin(UserRole.Manager))
      .expect(200)

    expect(response.body.provider).toEqual(payment.provider)
    expect(response.body.transactionId).toEqual(payment.transactionId)
  }
)
