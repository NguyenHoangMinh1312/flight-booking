import { Ticket } from "./ticket";

export enum OrderStatus {
  Created = "created",  // order is created, but the ticket is not reserved
  Canceled = "canceled",  // the user cancel/refund the order successfully
  AwaitingRefund = "awaiting-refund", // the order is awating refund to the customer
  Complete = "complete", // the user provides the payment successfully
  RefundFailed = "refund-failed"  // the order failed to refund
}

export enum RefundReason {
  FlightCanceled = "flight-canceled",
  Emergency = "emergency",
  IncorrectBookingInfo = "incorrect-booking-info",
  Other = "other"
}

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  expiresAt: string;
  createdAt: string,
  ticket: Ticket;
  refundReason: RefundReason
};