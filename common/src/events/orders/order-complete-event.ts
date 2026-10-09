import { Subjects } from "../subjects"

// couple the data to be sent to order:canceled channel
export interface OrderCompleteEvent {
  subject: Subjects.OrderComplete
  data: {
    id: string,
    version: number,
    ticket: {
      id: string,
    },
    userId: string
  }
}