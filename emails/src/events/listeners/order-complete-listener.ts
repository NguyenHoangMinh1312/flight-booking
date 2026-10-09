import { Listener, OrderCompleteEvent, Subjects } from "@mint1312-flight-booking/common"
import { Message } from "node-nats-streaming"
import { queueGroupName } from "./queue-group-name"
import { emailSendQueue } from "../../queues/email-send-queue"
import { User } from "../../models/user"

export class OrderCompleteListener extends Listener<OrderCompleteEvent> {
  readonly subject = Subjects.OrderComplete
  queueGroupName = queueGroupName

  async onMessage(data: OrderCompleteEvent["data"], msg: Message) {
    const user = await User.findById(data.userId)

    if (!user)
      throw new Error("User not found")

    await emailSendQueue.add({
      receiver: user.email,
      subject: `Thank you for your order!`,
      content: `Hello,

Thank you for your order! Your booking (ID: ${data.id}) for ticket ${data.ticket.id} has been successfully confirmed.

For additional information, please visit http://localhost/orders/${data.id}

If you have any questions or need further assistance, please feel free to contact our support team.

Best regards,
Flight Booking Team`
    })

    msg.ack()
  }
}