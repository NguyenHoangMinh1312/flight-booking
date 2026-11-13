import { RefundReason, UserRole, NotFoundError, UnauthorizedError, OrderStatus, BadRequestError } from "@mint1312-flight-booking/common";
import { Order } from "../models/order";
import { OrderCanceledPublisher } from "../events/publishers/order-canceled-publisher";
import { OrderAwaitingRefundPublisher } from "../events/publishers/order-awaiting-refund-publisher";
import mongoose from "mongoose";

const LATEST_ORDER_WINDOW = 3 * 60 * 60 * 1000  // user can only refund a paid order in latest 3 hour before the departure time

export const cancelOrder = async (
  orderId: string,
  userRole: UserRole,
  userId: string,
  refundReason: RefundReason
) => {
  // find the order
  const order = await Order.findById(orderId).populate("ticket")

  if (!order)
    throw new NotFoundError()

  if (userRole === UserRole.Customer && userId !== order.userId)
    throw new UnauthorizedError()

  if (order.status === OrderStatus.Canceled)
    throw new BadRequestError("Your order has already been canceled")

  if (order.status === OrderStatus.AwaitingRefund)
    throw new BadRequestError("We are processing your refund request")

  const departureDate = new Date(order.ticket.departureDate)
  const minimumCancelTime = new Date(Date.now() + LATEST_ORDER_WINDOW)
  if (departureDate < minimumCancelTime)
    throw new BadRequestError("Tickets cannot be canceled less than 3 hours before departure");

  // cancel order
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // if the order status is just created, mark it as canceled
    if (order.status === OrderStatus.Created) {
      order.set({ status: OrderStatus.Canceled })
      await order.save({ session })

      const outboxEvent = OrderCanceledPublisher.buildOutboxEvent({
        id: order.id,
        version: order.version,
        userId: order.userId,
        ticket: {
          id: order.ticket.id
        }
      })
      await outboxEvent.save({ session })
    }

    // if the order is paid, refund the order
    else if ([OrderStatus.Complete, OrderStatus.RefundFailed].includes(order.status)) {
      order.set({
        status: OrderStatus.AwaitingRefund,
        refundReason
      })
      await order.save({ session })

      // save the event to outbox
      const outboxEvent = OrderAwaitingRefundPublisher.buildOutboxEvent({
        id: order.id,
        version: order.version,
        reason: refundReason
      })
      await outboxEvent.save({ session })
    }

    // commit db transaction
    await session.commitTransaction()

  } catch (err) {
    await session.abortTransaction();
    throw new Error("Something went wrong. Please try again")
  } finally {
    await session.endSession()
  }
}