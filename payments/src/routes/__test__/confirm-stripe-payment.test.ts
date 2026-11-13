import { Order } from "../../models/order"
import mongoose from "mongoose"
import { OrderStatus, Subjects } from "@mint1312-flight-booking/common"
import { stripeClient } from "../../services/payment-clients/stripe-client"
import request from "supertest"
import { app } from "../../app"
import { UserRole } from "@mint1312-flight-booking/common"
import { Payment } from "../../models/payment"
import { Outbox } from "../../models/outbox"

it(
  "creates a payment and save payment:created event",
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