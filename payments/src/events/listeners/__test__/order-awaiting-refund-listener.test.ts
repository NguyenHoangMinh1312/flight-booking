import { natsWrapper } from "../../../nats-wrapper"
import { OrderAwaitingRefundListener } from "../order-awaiting-refund-listener"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Order } from "../../../models/order"
import { OrderAwaitingRefundEvent, OrderStatus } from "@mint1312-flight-booking/common"
import { Payment } from "../../../models/payment"
import { refundQueue } from "../../../queues/refund-queue"

jest.mock("../../../stripe")

it(
  "Checks if the listener handles event order:awating-refund successfully",
  async () => {
    // create an event listener
    const listener = new OrderAwaitingRefundListener(natsWrapper.client)

    // create a new order
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      price: 10
    })
    await order.save()

    // create a new payment
    const payment = Payment.build({
      orderId: order.id,
      stripeId: "pi_test"
    })
    await payment.save()

    // create a fake event
    const data: OrderAwaitingRefundEvent["data"] = {
      id: order.id,
      version: order.version + 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      }
    }

    // fake the ack function
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn()
    }

    // call the listener
    await listener.onMessage(data, msg)

    // check if the refund request sent to queue
    expect(refundQueue.add).toHaveBeenCalledTimes(1)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)