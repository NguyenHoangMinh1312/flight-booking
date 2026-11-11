import { Publisher, Subjects } from "@mint1312-flight-booking/common"
import { Outbox } from "../models/outbox"
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher"
import { UserOtpRequestedPublisher } from "../events/publishers/user-otp-requested-publisher"
import { natsWrapper } from "../nats-wrapper"

export const outboxPublisherWorker = (pollIntervalMs = 1000) => {
  let isProcessing = false

  const mapping = new Map<Subjects, Publisher<any>>()
  mapping.set(Subjects.UserCreated, new UserCreatedPublisher(natsWrapper.nc))
  mapping.set(Subjects.UserOtpRequested, new UserOtpRequestedPublisher(natsWrapper.nc))

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
