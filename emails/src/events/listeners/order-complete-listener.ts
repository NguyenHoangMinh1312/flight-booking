import { Listener, OrderCompleteEvent, Subjects } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { queueGroupName } from "./queue-group-name"
import { emailSendQueue } from "../../queues/email-send-queue"
import { User } from "../../models/user"

export class OrderCompleteListener extends Listener<OrderCompleteEvent> {
  readonly subject = Subjects.OrderComplete
  queueGroupName = queueGroupName

  async onMessage(data: OrderCompleteEvent["data"], msg: JsMsg) {
    const user = await User.findById(data.userId)

    if (!user)
      throw new Error("User not found")


    await emailSendQueue.add({
      receiver: user.email,
      subject: "Thank you for your order!",
      content: `
    <html>
      <body>
        <h2>Booking Confirmed</h2>

        <p>Hello,</p>

        <p>
          Thank you for your order! Your booking
          (ID: <strong>${data.id}</strong>) for ticket
          <strong>${data.ticket.id}</strong> has been
          successfully confirmed.
        </p>

        <p>
          For additional information, please visit
          <a href="http://flight-booking.shop/orders/${data.id}">
            your order details
          </a>.
        </p>

        <p>
          If you have any questions or need further assistance,
          please feel free to contact our support team.
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