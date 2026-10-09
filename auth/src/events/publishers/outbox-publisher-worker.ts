import { Subjects, UserCreatedEvent, UserOtpRequestedEvent } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"
import { UserCreatedPublisher } from "./user-created-publisher"
import { UserOtpRequestedPublisher } from "./user-otp-requested-publisher"
import { natsWrapper } from "../../nats-wrapper"

export const outboxPublisherWorker = (pollIntervalMs = 1000) => {
  let isProcessing = false

  const userCreatedPublisher = new UserCreatedPublisher(natsWrapper.client)
  const userOtpRequestedPublisher = new UserOtpRequestedPublisher(natsWrapper.client)

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
            case Subjects.UserCreated:
              await userCreatedPublisher.publish(event.payload as UserCreatedEvent["data"])
              break
            case Subjects.UserOtpRequested:
              await userOtpRequestedPublisher.publish(event.payload as UserOtpRequestedEvent["data"])
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
