import { Subjects } from "./subjects"

// couple the data to be sent to ticket:created channel
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated
  data: {
    id: string,
    version: number,
    price: number,
    class: string,
    status: string,
    seat: {
      row: number,
      column: number
    },
    departureDate: Date
  }
}