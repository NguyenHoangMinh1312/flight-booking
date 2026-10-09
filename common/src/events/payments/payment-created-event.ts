import { Subjects } from "../subjects"

// couple the data to be sent to ticket:created channel
export interface PaymentCreatedEvent {
  subject: Subjects.PaymentCreated
  data: {
    id: string,
    version: number
    orderId: string,
    stripeId: string,
  }
}