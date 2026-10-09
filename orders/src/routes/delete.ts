import { NotFoundError, requireAuth, UnauthorizedError, BadRequestError, OrderStatus } from "@mint1312-flight-booking/common"
import express, { Request, Response } from "express"
import { Order } from "../models/order"
import mongoose from "mongoose"
import { OrderCanceledPublisher } from "../events/publishers/order-canceled-publisher"
import { OrderAwaitingRefundPublisher } from "../events/publishers/order-awaiting-refund-publisher"

const router = express.Router()
const LATEST_ORDER_WINDOW = 3 * 60 * 60 * 1000  // user can only refund a paid order in latest 3 hour before the departure time

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    // find the order
    const order = await Order.findById(req.params.orderId).populate("ticket")
    if (!order)
      throw new NotFoundError()

    if (order.userId !== req.currentUser!.id)
      throw new UnauthorizedError()

    if (order.status === OrderStatus.Canceled)
      throw new BadRequestError("Cannot cancel a canceled order")

    if (order.status === OrderStatus.AwaitingRefund)
      throw new BadRequestError("Your order is awaiting refund")

    // check for the cancel time
    const departureDate = new Date(order.ticket.departureDate)
    const minimumCancelTime = new Date(Date.now() + LATEST_ORDER_WINDOW)
    if (departureDate < minimumCancelTime)
      throw new BadRequestError("Tickets cannot be canceled less than 3 hours before departure");

    // db transaction
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      // if the order status is just created (not paid) 
      if (order.status === OrderStatus.Created) {
        order.set({ status: OrderStatus.Canceled })
        await order.save({ session })

        // save event to outbox
        const outboxEvent = OrderCanceledPublisher.buildOutboxEvent({
          id: order.id,
          version: order.version,
          ticket: {
            id: order.ticket.id
          },
          userId: order.userId
        })
        await outboxEvent.save({ session })
      }

      // if the order is paid
      else if ([OrderStatus.Complete, OrderStatus.RefundFailed].includes(order.status)) {
        order.set({ status: OrderStatus.AwaitingRefund })
        await order.save({ session })

        // save the event to outbox
        const outboxEvent = OrderAwaitingRefundPublisher.buildOutboxEvent({
          id: order.id,
          version: order.version,
          ticket: {
            id: order.ticket.id
          }
        })
        await outboxEvent.save({ session })
      }

      // commit db transaction
      await session.commitTransaction()

      res.status(200).send({ message: "Your order cancel request is being processed" })
    } catch (err) {
      await session.abortTransaction();
      throw new Error("Something went wrong. Please try again")
    } finally {
      await session.endSession()
      return
    }
  }
)

export { router as deleteOrderRouter }