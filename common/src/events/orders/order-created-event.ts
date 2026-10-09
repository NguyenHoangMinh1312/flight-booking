import { Subjects } from "../subjects"
import { OrderStatus } from "../../types/order-status"

// couple the data to be sent to order:created channel
export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated
  data: {
    id: string,
    version: number,
    status: OrderStatus,
    userId: string,
    expiresAt: string,
    ticket: {
      id: string,
      price: number
    }
  }
}