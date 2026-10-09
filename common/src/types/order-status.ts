export enum OrderStatus {
  Created = "created",  // order is created, but the ticket is not reserved
  Canceled = "canceled",  // the user cancel/refund the order successfully
  AwaitingRefund = "awaiting-refund", // the order is awating refund to the customer
  Complete = "complete", // the user provides the payment successfully
  RefundFailed = "refund-failed"  // the order failed to refund
}