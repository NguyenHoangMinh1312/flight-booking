import Queue from "bull";
import { OutboxDoc } from "../models/outbox";
import { stripe } from "../stripe";
import { RefundCompletePublisher } from "../events/publishers/refund-complete-publisher";
import { RefundFailedPublisher } from "../events/publishers/refund-failed-publisher";

const PENALTY_FEE = 5000  // keep 5000 as penalty refund fee 

interface Payload {
  orderId: string,
  stripeId: string,
  price: number
}

const refundQueue = new Queue<Payload>("payments:refund", {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
})

refundQueue.process(async (job) => {
  const refundAmount = job.data.price - PENALTY_FEE

  if (refundAmount <= 0)
    throw new Error(`Refund amount (${refundAmount} VND) must be greater than 0`)

  // perform the refund
  const refund = await stripe.refunds.create({
    payment_intent: job.data.stripeId,
    amount: refundAmount,
    metadata: {
      orderId: job.data.orderId,
      originalPrice: job.data.price,
      penaltyFee: PENALTY_FEE
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