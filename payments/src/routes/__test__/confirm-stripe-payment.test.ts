import { Order } from "../../models/order"
import mongoose from "mongoose"
import { OrderStatus, Subjects, UserRole } from "@mint1312-flight-booking/common"
import { stripeClient } from "../../services/payment-clients/stripe-client"
import request from "supertest"
import { app } from "../../app"
import { Payment, PaymentProvider } from "../../models/payment"
import { Outbox } from "../../models/outbox"

const setup = async (status: OrderStatus = OrderStatus.Created) => {
  jest.clearAllMocks()

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status,
    price: 150000,
  })
  await order.save()

  const stripeId = "pi_test_123"

  return { order, stripeId }
}

it(
  "returns 401 when user is not authenticated",
  async () => {
    await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .send({ paymentIntentId: "pi_test_123" })
      .expect(401)
  }
)

it(
  "returns 400 when paymentIntentId is missing or empty",
  async () => {
    await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .set("Cookie", global.signin(UserRole.Customer))
      .send({})
      .expect(400)

    await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .set("Cookie", global.signin(UserRole.Customer))
      .send({ paymentIntentId: "" })
      .expect(400)
  }
)

it(
  "returns 200 and does not create payment when paymentIntent status is not succeeded",
  async () => {
    const { order, stripeId } = await setup();

    (stripeClient.retrievePaymentIntent as jest.Mock).mockReturnValueOnce({
      status: "requires_payment_method",
      metadata: { orderId: order.id, userId: order.userId },
      id: stripeId
    })

    const response = await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .set("Cookie", global.signin(UserRole.Customer, order.userId))
      .send({ paymentIntentId: stripeId })
      .expect(200)

    expect(response.body).toEqual({ received: true })
    expect(await Payment.find({})).toHaveLength(0)
    expect(await Outbox.find({})).toHaveLength(0)
  }
)

it(
  "returns 200 and does not create payment when orderId is missing in metadata",
  async () => {
    const { order, stripeId } = await setup();

    (stripeClient.retrievePaymentIntent as jest.Mock).mockReturnValueOnce({
      status: "succeeded",
      metadata: { userId: order.userId },
      id: stripeId
    })

    const response = await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .set("Cookie", global.signin(UserRole.Customer, order.userId))
      .send({ paymentIntentId: stripeId })
      .expect(200)

    expect(response.body).toEqual({ received: true })
    expect(await Payment.find({})).toHaveLength(0)
    expect(await Outbox.find({})).toHaveLength(0)
  }
)

it(
  "returns 200 and does not create payment when userId is missing in metadata",
  async () => {
    const { order, stripeId } = await setup();

    (stripeClient.retrievePaymentIntent as jest.Mock).mockReturnValueOnce({
      status: "succeeded",
      metadata: { orderId: order.id },
      id: stripeId
    })

    const response = await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .set("Cookie", global.signin(UserRole.Customer, order.userId))
      .send({ paymentIntentId: stripeId })
      .expect(200)

    expect(response.body).toEqual({ received: true })
    expect(await Payment.find({})).toHaveLength(0)
    expect(await Outbox.find({})).toHaveLength(0)
  }
)

it(
  "returns 401 when userId does not match metadata userId",
  async () => {
    const { order, stripeId } = await setup();

    (stripeClient.retrievePaymentIntent as jest.Mock).mockReturnValueOnce({
      status: "succeeded",
      metadata: { orderId: order.id, userId: order.userId },
      id: stripeId
    })

    await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .set("Cookie", global.signin(UserRole.Customer))
      .send({ paymentIntentId: stripeId })
      .expect(401)

    expect(await Payment.find({})).toHaveLength(0)
    expect(await Outbox.find({})).toHaveLength(0)
  }
)

it(
  "returns 200 and does not create payment when order is not in Created status",
  async () => {
    const { order, stripeId } = await setup(OrderStatus.Canceled);

    (stripeClient.retrievePaymentIntent as jest.Mock).mockReturnValueOnce({
      status: "succeeded",
      metadata: { orderId: order.id, userId: order.userId },
      id: stripeId
    })

    const response = await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .set("Cookie", global.signin(UserRole.Customer, order.userId))
      .send({ paymentIntentId: stripeId })
      .expect(200)

    expect(response.body).toEqual({ received: true })
    expect(await Payment.find({})).toHaveLength(0)
    expect(await Outbox.find({})).toHaveLength(0)
  }
)

it(
  "returns 200 and does not create duplicate payment if payment was already processed",
  async () => {
    const { order, stripeId } = await setup()

    const existingPayment = Payment.build({
      order,
      provider: PaymentProvider.Stripe,
      transactionId: stripeId,
    })
    await existingPayment.save();

    (stripeClient.retrievePaymentIntent as jest.Mock).mockReturnValueOnce({
      status: "succeeded",
      metadata: { orderId: order.id, userId: order.userId },
      id: stripeId
    })

    const response = await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .set("Cookie", global.signin(UserRole.Customer, order.userId))
      .send({ paymentIntentId: stripeId })
      .expect(200)

    expect(response.body).toEqual({ received: true })
    expect(await Payment.find({})).toHaveLength(1)
    expect(await Outbox.find({})).toHaveLength(0)
  }
)

it(
  "creates a payment and save payment:created event",
  async () => {
    const { order, stripeId } = await setup();

    (stripeClient.retrievePaymentIntent as jest.Mock).mockReturnValueOnce({
      status: "succeeded",
      metadata: { orderId: order.id, userId: order.userId },
      id: stripeId
    })

    await request(app)
      .post("/api/payments/confirm-stripe-payment")
      .set("Cookie", global.signin(UserRole.Customer, order.userId))
      .send({ paymentIntentId: stripeId })
      .expect(200)

    const payment = await Payment.findOne({ transactionId: stripeId }).populate("order")
    expect(payment).toBeDefined()
    expect(payment!.order.id).toEqual(order.id)
    expect(payment!.transactionId).toEqual(stripeId)

    // Check if event is saved to outbox
    const outboxEvent = await Outbox.find({})
    expect(outboxEvent).toBeDefined()
    expect(outboxEvent).toHaveLength(1)
    expect(outboxEvent[0]?.eventType).toEqual(Subjects.PaymentCreated)
    expect(outboxEvent[0]?.payload.id).toEqual(payment!.id)
    expect(outboxEvent[0]?.payload.orderId).toEqual(order.id)
  }
)
