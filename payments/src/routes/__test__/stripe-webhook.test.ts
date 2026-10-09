import request from "supertest"
import mongoose from "mongoose"
import { app } from "../../app"
import { Order } from "../../models/order"
import { Payment } from "../../models/payment"
import { OrderStatus, Subjects } from "@mint1312-flight-booking/common"
import { stripe } from "../../stripe"
import { Outbox } from "../../models/outbox"

it(
  "returns 400 when stripe-signature header is missing",
  async () => {
    await request(app)
      .post("/api/payments/stripe-webhook")
      .send(JSON.stringify({ type: "payment_intent.succeeded" }))
      .expect(400)
  }
)

it(
  "returns 400 when signature verification fails",
  async () => {
    // mock the stripe webhook 
    (stripe.webhooks.constructEvent as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Invalid signature")
    })

    await request(app)
      .post("/api/payments/stripe-webhook")
      .set("stripe-signature", "invalid_sig")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ type: "payment_intent.succeeded" }))
      .expect(400)
  }
)

it(
  "creates a payment and save payment:created event when payment_intent.succeeded",
  async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      price: 150000,
    })
    await order.save()

    const stripeId = "pi_test_123";

    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce({
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: stripeId,
          metadata: { orderId: order.id },
        },
      },
    })

    const response = await request(app)
      .post("/api/payments/stripe-webhook")
      .set("stripe-signature", "valid_sig")
      .expect(200)

    expect(response.body).toEqual({ received: true })

    // Verify payment was saved in DB
    const payment = await Payment.findOne({ stripeId })
    expect(payment).toBeDefined()
    expect(payment!.orderId).toEqual(order.id)
    expect(payment!.stripeId).toEqual(stripeId)

    // Check if event is saved to outbox
    const outboxEvent = await Outbox.find({})
    expect(outboxEvent).toBeDefined()
    expect(outboxEvent).toHaveLength(1)
    expect(outboxEvent[0]?.eventType).toEqual(Subjects.PaymentCreated)
    expect(outboxEvent[0]?.payload.id).toEqual(payment!.id)
    expect(outboxEvent[0]?.payload.orderId).toEqual(order.id)
  }
)