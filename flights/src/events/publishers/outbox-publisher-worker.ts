import { Subjects, TicketCanceledEvent, TicketCreatedEvent, TicketUpdatedEvent } from "@mint1312-flight-booking/common"
import { Outbox } from "../../models/outbox"
import { TicketCreatedPublisher } from "./ticket-created-publisher"
import { TicketUpdatedPublisher } from "./ticket-updated-publisher"
import { TicketCanceledPublisher } from "./ticket-canceled-publisher"
import { natsWrapper } from "../../nats-wrapper"

export const outboxPublisherWorker = (pollIntervalMs = 1000) => {
  let isProcessing = false

  const ticketCreatedPublisher = new TicketCreatedPublisher(natsWrapper.nc)
  const ticketUpdatedPublisher = new TicketUpdatedPublisher(natsWrapper.nc)
  const ticketCanceledPublisher = new TicketCanceledPublisher(natsWrapper.nc)

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
            case Subjects.TicketCreated:
              await ticketCreatedPublisher.publish(event.payload as TicketCreatedEvent["data"])
              break
            case Subjects.TicketUpdated:
              await ticketUpdatedPublisher.publish(event.payload as TicketUpdatedEvent["data"])
              break
            case Subjects.TicketCanceled:
              await ticketCanceledPublisher.publish(event.payload as TicketCanceledEvent["data"])
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
