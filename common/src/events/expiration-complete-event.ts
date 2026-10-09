import { Subjects } from "./subjects"

// couple the data to be sent to order:created channel
export interface ExpirationCompleteEvent {
  subject: Subjects.ExpirationComplete
  data: {
    orderId: string,
  }
}