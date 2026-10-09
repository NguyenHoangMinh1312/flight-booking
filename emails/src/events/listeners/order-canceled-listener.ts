import { Listener, OrderCanceledEvent, Subjects } from "@mint1312-flight-booking/common"
import { Message } from "node-nats-streaming"
import { queueGroupName } from "./queue-group-name"
import { emailSendQueue } from "../../queues/email-send-queue"
import { User } from "../../models/user"

export class OrderCanceledListener extends Listener<OrderCanceledEvent> {
  readonly subject = Subjects.OrderCanceled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCanceledEvent["data"], msg: Message) {
    const user = await User.findById(data.userId)

    if (!user)
      throw new Error("User not found")

    await emailSendQueue.add({
      receiver: user.email,
      subject: `Your order ${data.id} has been canceled.`,
      content: `Hello,

Your order with ID ${data.id} for ticket ${data.ticket.id} has been canceled.

If you did not request this cancellation or have any questions, please contact our support team.

Best regards,
Flight Booking Team`
    })

    msg.ack()
  }
}