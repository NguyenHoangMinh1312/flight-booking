import { Subjects } from "../subjects"

// couple the data to be sent to order:canceled channel
export interface OrderAwaitingRefundEvent {
  subject: Subjects.OrderAwaitingRefund
  data: {
    id: string,
    version: number,
    ticket: {
      id: string,
    }
  }
}