import { PaymentCreatedEvent, RefundCompleteEvent, RefundFailedEvent, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"
import { PaymentCreatedPublisher } from "./payment-created-publisher"
import { RefundCompletePublisher } from "./refund-complete-publisher"
import { RefundFailedPublisher } from "./refund-failed-publisher"
import { natsWrapper } from "../../nats-wrapper"

export const outboxPublisherWorker = (pollIntervalMs = 1000) => {
  let isProcessing = false

  const paymentCreatedPublisher = new PaymentCreatedPublisher(natsWrapper.nc)
  const refundCompletePublisher = new RefundCompletePublisher(natsWrapper.nc)
  const refundFailedPublisher = new RefundFailedPublisher(natsWrapper.nc)

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
            case Subjects.PaymentCreated:
              await paymentCreatedPublisher.publish(event.payload as PaymentCreatedEvent["data"])
              break
            case Subjects.RefundComplete:
              await refundCompletePublisher.publish(event.payload as RefundCompleteEvent["data"])
              break
            case Subjects.RefundFailed:
              await refundFailedPublisher.publish(event.payload as RefundFailedEvent["data"])
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
