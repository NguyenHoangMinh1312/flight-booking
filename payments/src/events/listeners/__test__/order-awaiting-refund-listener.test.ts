import { natsWrapper } from "../../../nats-wrapper"
import { OrderAwaitingRefundListener } from "../order-awaiting-refund-listener"
import mongoose from "mongoose"
import { JsMsg } from "nats"
import { Order } from "../../../models/order"
import { OrderAwaitingRefundEvent, OrderStatus, RefundReason } from "@mint1312-flight-booking/common"
import { Payment, PaymentProvider } from "../../../models/payment"
import { refundWorker } from "../../../workers/refund-worker"

const setup = async () => {
  jest.clearAllMocks()

  // create an event listener
  const listener = new OrderAwaitingRefundListener(natsWrapper.nc)

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
    order,
    transactionId: "123",
    provider: PaymentProvider.Stripe
  })
  await payment.save()

  // create a fake event
  const data: OrderAwaitingRefundEvent["data"] = {
    id: order.id,
    version: order.version + 1,
    reason: RefundReason.FlightCanceled
  }

  // fake the ack function
  const msg = {
    ack: jest.fn()
  } as unknown as JsMsg

  return { listener, order, payment, data, msg }
}

it(
  "Checks if the listener handles event order:awaiting-refund successfully",
  async () => {
    const { listener, order, payment, data, msg } = await setup()

    // call the listener
    await listener.onMessage(data, msg)

    // check if the order status is updated
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder?.version).toEqual(data.version)
    expect(updatedOrder?.status).toEqual(OrderStatus.AwaitingRefund)

    // check if the refund request sent to queue
    expect(refundWorker.add).toHaveBeenCalledTimes(1)
    expect(refundWorker.add).toHaveBeenCalledWith({
      orderId: order.id,
      transactionId: payment.transactionId,
      price: order.price,
      reason: data.reason
    })

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)

it(
  "Throws an error when the order is not found",
  async () => {
    const { listener, data, msg } = await setup()
    data.id = new mongoose.Types.ObjectId().toHexString()

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Order not found")
    expect(refundWorker.add).not.toHaveBeenCalled()
    expect(msg.ack).not.toHaveBeenCalled()
  }
)

it(
  "Acks the message and does not enqueue refund when a duplicate or old event is received",
  async () => {
    const { listener, order, data, msg } = await setup()
    data.version = order.version

    await listener.onMessage(data, msg)

    const unchangedOrder = await Order.findById(order.id)
    expect(unchangedOrder?.version).toEqual(0)
    expect(unchangedOrder?.status).toEqual(OrderStatus.Created)
    expect(refundWorker.add).not.toHaveBeenCalled()
    expect(msg.ack).toHaveBeenCalledTimes(1)
  }
)

it(
  "Throws an error when an out-of-order event is received",
  async () => {
    const { listener, order, data, msg } = await setup()
    data.version = order.version + 2

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Out of order event received")
    expect(refundWorker.add).not.toHaveBeenCalled()
    expect(msg.ack).not.toHaveBeenCalled()
  }
)

it(
  "Throws an error when payment is not found for the order",
  async () => {
    const { listener, data, msg } = await setup()
    await Payment.deleteMany({})

    await expect(listener.onMessage(data, msg)).rejects.toThrow("Payment not found")
    expect(refundWorker.add).not.toHaveBeenCalled()
    expect(msg.ack).not.toHaveBeenCalled()
  }
)
