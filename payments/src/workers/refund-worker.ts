import Queue from "bull";
import { OutboxDoc } from "../models/outbox";
import { RefundCompletePublisher } from "../events/publishers/refund-complete-publisher";
import { RefundFailedPublisher } from "../events/publishers/refund-failed-publisher";
import { RefundReason } from "@mint1312-flight-booking/common";
import { IPaymentClient } from "../services/payment-clients/payment-client-interface";
import { stripeClient } from "../services/payment-clients/stripe-client";

type RefundMessage = {
  orderId: string,
  transactionId: string,
  price: number,
  reason: RefundReason
}

class RefundWorker {
  private paymentClient: IPaymentClient
  private queue: Queue.Queue<RefundMessage>
  public penaltyPercent = 0.01

  constructor(paymentClient: IPaymentClient, queue: Queue.Queue) {
    this.paymentClient = paymentClient
    this.queue = queue
    this.setQueueProcess()
  }

  // set the logic for backgound process
  private setQueueProcess() {
    this.queue.process(async (job) => {
      const penaltyFee = job.data.reason === RefundReason.FlightCanceled ? 0 : this.penaltyPercent * job.data.price
      const refundAmount = job.data.price - penaltyFee

      if (refundAmount <= 0)
        throw new Error(`Refund amount (${refundAmount} VND) must be greater than 0`)

      const refundOk = await this.paymentClient.refund(
        job.data.transactionId,
        refundAmount,
        {
          orderId: job.data.orderId,
          originalPrice: job.data.price,
          penaltyFee: penaltyFee,
          reason: job.data.reason
        }
      )

      let outboxEvent: OutboxDoc
      if (refundOk) {
        outboxEvent = RefundCompletePublisher.buildOutboxEvent({
          orderId: job.data.orderId
        })
      }

      else
        outboxEvent = RefundFailedPublisher.buildOutboxEvent({
          orderId: job.data.orderId
        })

      await outboxEvent.save()
    })
  }

  public async add(message: RefundMessage) {
    await this.queue.add(message, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000
      }
    })
  }
}

const refundQueue = new Queue<RefundMessage>("payments:refund", {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
})

export const refundWorker = new RefundWorker(stripeClient, refundQueue)