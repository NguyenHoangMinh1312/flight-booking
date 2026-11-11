import { Subjects, Publisher } from "@mint1312-flight-booking/common"
import { Outbox } from "../models/outbox"
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher"
import { RefundCompletePublisher } from "../events/publishers/refund-complete-publisher"
import { RefundFailedPublisher } from "../events/publishers/refund-failed-publisher"
import { natsWrapper } from "../nats-wrapper"

export const outboxPublisherWorker = (pollIntervalMs = 1000) => {
  let isProcessing = false

  const mapping = new Map<Subjects, Publisher<any>>()
  mapping.set(Subjects.PaymentCreated, new PaymentCreatedPublisher(natsWrapper.nc))
  mapping.set(Subjects.RefundComplete, new RefundCompletePublisher(natsWrapper.nc))
  mapping.set(Subjects.RefundFailed, new RefundFailedPublisher(natsWrapper.nc))

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
          const publisher = mapping.get(event.eventType as Subjects)
          await publisher?.publish(event.payload)

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
