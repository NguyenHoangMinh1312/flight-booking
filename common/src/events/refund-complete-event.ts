import { Subjects } from "./subjects"

// couple the data to be sent to ticket:created channel
export interface RefundCompleteEvent {
  subject: Subjects.RefundComplete
  data: {
    orderId: string
  }
}