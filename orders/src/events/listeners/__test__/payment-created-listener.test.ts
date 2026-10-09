import { natsWrapper } from "../../../nats-wrapper"
import { Subjects, OrderStatus, PaymentCreatedEvent, FlightStatus } from "@mint1312-flight-booking/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Order } from "../../../models/order"
import { Ticket } from "../../../models/ticket"
import { Outbox } from "../../../models/outbox"
import { PaymentCreatedListener } from "../payment-created-listener"

it(
  "Checks if the listener handles event expiration:complete successfully",
  async () => {
    // create an event listener
    const listener = new PaymentCreatedListener(natsWrapper.client)

    // create a ticket
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      price: 10,
      class: "business",
      status: FlightStatus.Available,
      seat: {
        row: 1,
        column: 1
      },
      departureDate: new Date()
    })
    await ticket.save()

    // create an order
    const order = Order.build({
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticket: ticket
    })
    await order.save()

    // create a fake event
    const data: PaymentCreatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      orderId: order.id,
      stripeId: new mongoose.Types.ObjectId().toHexString()
    }

    // fake the ack function
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn()
    }

    // call the listener
    await listener.onMessage(data, msg)

    // check if the order status is updated
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder?.status).toEqual(OrderStatus.Complete)

    // check if the ack is called
    expect(msg.ack).toHaveBeenCalled()

    // expect the event to be saved to outbox
    const outboxEvents = await Outbox.find({})
    expect(outboxEvents).toBeDefined()
    expect(outboxEvents).toHaveLength(1)
    expect(outboxEvents[0]?.eventType).toEqual(Subjects.OrderComplete)
  }
)