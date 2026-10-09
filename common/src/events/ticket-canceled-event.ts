import { Subjects } from "./subjects"

// couple the data to be sent to ticket:created channel
export interface TicketCanceledEvent {
  subject: Subjects.TicketCanceled
  data: {
    id: string,
    version: number
  }
}