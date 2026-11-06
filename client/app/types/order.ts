import { Ticket } from "./ticket";

export type OrderStatus = "created" | "canceled" | "awaiting-refund" | "complete" | "refund-failed";

export type RefundReason = "flight-canceled" | "emergency" | "incorrect-booking-info" | "other";

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  expiresAt: string;
  createdAt: string,
  ticket: Ticket;
  refundReason: RefundReason
};