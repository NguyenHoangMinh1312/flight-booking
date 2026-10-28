import { Listener, OrderCanceledEvent, Subjects } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { queueGroupName } from "./queue-group-name"
import { emailSendQueue } from "../../queues/email-send-queue"
import { User } from "../../models/user"

export class OrderCanceledListener extends Listener<OrderCanceledEvent> {
  readonly subject = Subjects.OrderCanceled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCanceledEvent["data"], msg: JsMsg) {
    const user = await User.findById(data.userId)

    if (!user)
      throw new Error("User not found")

    await emailSendQueue.add({
      receiver: user.email,
      subject: `Your order ${data.id} has been canceled.`,
      content: `
    <html>
      <body>
        <h2>Order Canceled</h2>

        <p>Hello,</p>

        <p>
          Your order with ID <strong>${data.id}</strong>
          for ticket <strong>${data.ticket.id}</strong>
          has been canceled.
        </p>

        <p>
          If you did not request this cancellation or have any
          questions, please contact our support team.
        </p>

        <p>
          Best regards,<br />
          Flight Booking Team
        </p>
      </body>
    </html>
  `
    })

    msg.ack()
  }
}