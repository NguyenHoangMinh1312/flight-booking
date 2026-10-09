import { Subjects } from "../subjects"

// couple the data to be sent to order:refund-failed channel
export interface OrderRefundFailedEvent {
  subject: Subjects.OrderRefundFailed
  data: {
    id: string,
    version: number,
  }
}