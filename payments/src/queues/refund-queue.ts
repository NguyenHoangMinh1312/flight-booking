import Queue from "bull";
import { OutboxDoc } from "../models/outbox";
import { stripe } from "../stripe";
import { RefundCompletePublisher } from "../events/publishers/refund-complete-publisher";
import { RefundFailedPublisher } from "../events/publishers/refund-failed-publisher";

interface Payload {
  orderId: string,
  stripeId: string
}

const refundQueue = new Queue<Payload>("payments:refund", {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
})

refundQueue.process(async (job) => {
  // perform the refund
  const refund = await stripe.refunds.create({ payment_intent: job.data.stripeId })

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