// all NATS streaming subjects
export enum Subjects {
  UserCreated = "user:created",
  UserOtpRequested = "user:otp-requested",
  TicketCreated = "ticket:created",
  TicketUpdated = "ticket:updated",
  TicketCanceled = "ticket:canceled",
  OrderCreated = "order:created",
  OrderCanceled = "order:canceled",
  OrderComplete = "order:complete",
  OrderAwaitingRefund = "order:awating-refund",
  OrderRefundFailed = "order:refund-failed",
  ExpirationComplete = "expiration:complete",
  PaymentCreated = "payment:created",
  RefundComplete = "payment:refund-complete",
  RefundFailed = "payment:refund-failed"
}

