import {
  OrderAwaitingRefundEvent,
  OrderCanceledEvent,
  OrderCompleteEvent,
  OrderCreatedEvent,
  OrderRefundFailedEvent,
  Subjects
} from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"
import { OrderAwaitingRefundPublisher } from "./order-awaiting-refund-publisher"
import { OrderCanceledPublisher } from "./order-canceled-publisher"
import { OrderCompletePublisher } from "./order-complete-publisher"
import { OrderCreatedPublisher } from "./order-created-publisher"
import { OrderRefundFailedPublisher } from "./order-refund-failed-publisher"
import { natsWrapper } from "../../nats-wrapper"

export const outboxPublisherWorker = (pollIntervalMs = 1000) => {
  let isProcessing = false

  const orderAwaitingRefundPublisher = new OrderAwaitingRefundPublisher(natsWrapper.nc)
  const orderCanceledPublisher = new OrderCanceledPublisher(natsWrapper.nc)
  const orderCompletePublisher = new OrderCompletePublisher(natsWrapper.nc)
  const orderCreatedPublisher = new OrderCreatedPublisher(natsWrapper.nc)
  const orderRefundFailedPublisher = new OrderRefundFailedPublisher(natsWrapper.nc)

  return setInterval(async () => {
    // Prevent overlapping runs from processing the same events
    if (isProcessing)
      return
    isProcessing = true

    try {
      // Get the oldest events in FIFO order
      const events = await Outbox.find().sort({ createdAt: 1 }).limit(20)

      for (const event of events) {
        try {
          switch (event.eventType) {
            case Subjects.OrderAwaitingRefund:
              await orderAwaitingRefundPublisher.publish(event.payload as OrderAwaitingRefundEvent["data"])
              break
            case Subjects.OrderCanceled:
              await orderCanceledPublisher.publish(event.payload as OrderCanceledEvent["data"])
              break
            case Subjects.OrderComplete:
              await orderCompletePublisher.publish(event.payload as OrderCompleteEvent["data"])
              break
            case Subjects.OrderCreated:
              await orderCreatedPublisher.publish(event.payload as OrderCreatedEvent["data"])
              break
            case Subjects.OrderRefundFailed:
              await orderRefundFailedPublisher.publish(event.payload as OrderRefundFailedEvent["data"])
              break
            default:
              console.warn(`Unhandled eventType: ${event.eventType}`)
              continue
          }

          // Clear the event after publishing
          await Outbox.findByIdAndDelete(event.id)
        } catch (err) {
          console.error(`Failed to publish outbox event ${event.id}:`, err)
          break
        }
      }
    } catch (err) {
      console.error("Error querying outbox collection:", err)
    } finally {
      isProcessing = false
    }
  }, pollIntervalMs)
}
