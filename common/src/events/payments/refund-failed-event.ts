import { Subjects } from "../subjects"

// couple the data to be sent to ticket:created channel
export interface RefundFailedEvent {
  subject: Subjects.RefundFailed
  data: {
    orderId: string
  }
}