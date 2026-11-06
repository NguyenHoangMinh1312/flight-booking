import Queue from "bull";
import { OutboxDoc } from "../models/outbox";
import { stripe } from "../stripe";
import { RefundCompletePublisher } from "../events/publishers/refund-complete-publisher";
import { RefundFailedPublisher } from "../events/publishers/refund-failed-publisher";
import { RefundReason } from "@mint1312-flight-booking/common";

const PENALTY_PERCENTILE = 0.01

interface Payload {
  orderId: string,
  stripeId: string,
  price: number,
  reason: RefundReason
}

const refundQueue = new Queue<Payload>("payments:refund", {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
})

refundQueue.process(async (job) => {
  const penaltyFee = job.data.reason === RefundReason.FlightCanceled ? 0 : PENALTY_PERCENTILE * job.data.price
  const refundAmount = job.data.price - penaltyFee

  if (refundAmount <= 0)
    throw new Error(`Refund amount (${refundAmount} VND) must be greater than 0`)

  // perform the refund
  const refund = await stripe.refunds.create({
    payment_intent: job.data.stripeId,
    amount: refundAmount,
    metadata: {
      orderId: job.data.orderId,
      originalPrice: job.data.price,
      penaltyFee: penaltyFee,
      reason: job.data.reason
    }
  })

  let outboxEvent: OutboxDoc

  // if refund successfully
  if (refund.status === "succeeded")
    outboxEvent = RefundCompletePublisher.buildOutboxEvent({
      orderId: job.data.orderId
    })

  // if failed to refund
  else
    outboxEvent = RefundFailedPublisher.buildOutboxEvent({
      orderId: job.data.orderId
    })

  await outboxEvent.save()
})

export { refundQueue }