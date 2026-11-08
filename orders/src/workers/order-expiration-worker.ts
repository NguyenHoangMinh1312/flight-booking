import Queue from "bull";
import mongoose from "mongoose";
import { Order } from "../models/order";
import { OrderStatus } from "@mint1312-flight-booking/common";
import { OrderCanceledPublisher } from "../events/publishers/order-canceled-publisher";

type OrderExpirationMessage = {
  orderId: string,
}

class OrderExpirationWorker {
  private queue: Queue.Queue<OrderExpirationMessage>

  constructor(queue: Queue.Queue) {
    this.queue = queue
    this.setQueueOperation()
  }

  private setQueueOperation() {
    this.queue.process(async (job) => {
      const order = await Order.findById(job.data.orderId)
      if (!order)
        throw new Error("Order not found")

      if (order.status !== OrderStatus.Created)
        return

      // db transaction
      const session = await mongoose.startSession()

      try {
        session.startTransaction()

        // update order status
        order.set({ status: OrderStatus.Canceled })
        await order.save({ session })

        // save the event to outbox
        const outboxEvent = OrderCanceledPublisher.buildOutboxEvent({
          id: order.id,
          version: order.version,
          ticket: {
            id: order.ticket.id
          },
          userId: order.userId
        })
        await outboxEvent.save({ session })

        // commit db transaction
        await session.commitTransaction()
      } catch (err) {
        await session.abortTransaction();
        throw new Error("Something went wrong. Please try again")
      } finally {
        await session.endSession()
      }
    })
  }

  public async add(message: OrderExpirationMessage, delay: number) {
    await this.queue.add(message, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000
      },
      delay
    })
  }
}

const queue = new Queue<OrderExpirationMessage>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
})

export const orderExpirationWorker = new OrderExpirationWorker(queue)