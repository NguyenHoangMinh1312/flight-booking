import { Subjects, Publisher } from "@mint1312-flight-booking/common"
import { Outbox } from "../models/outbox"
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher"
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher"
import { TicketCanceledPublisher } from "../events/publishers/ticket-canceled-publisher"
import { natsWrapper } from "../nats-wrapper"

export const outboxPublisherWorker = (pollIntervalMs = 1000) => {
  let isProcessing = false

  const mapping = new Map<Subjects, Publisher<any>>()
  mapping.set(Subjects.TicketCreated, new TicketCreatedPublisher(natsWrapper.nc))
  mapping.set(Subjects.TicketUpdated, new TicketUpdatedPublisher(natsWrapper.nc))
  mapping.set(Subjects.TicketCanceled, new TicketCanceledPublisher(natsWrapper.nc))

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
