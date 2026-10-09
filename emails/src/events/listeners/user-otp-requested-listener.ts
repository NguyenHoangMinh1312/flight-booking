import { Listener, UserOtpRequestedEvent, Subjects } from "@mint1312-flight-booking/common"
import { Message } from "node-nats-streaming"
import { queueGroupName } from "./queue-group-name"
import { emailSendQueue } from "../../queues/email-send-queue"

export class UserOtpRequestedListener extends Listener<UserOtpRequestedEvent> {
  readonly subject = Subjects.UserOtpRequested
  queueGroupName = queueGroupName

  async onMessage(data: UserOtpRequestedEvent["data"], msg: Message) {
    await emailSendQueue.add({
      receiver: data.email,
      subject: "Your Flight Booking Verification Code",
      content: `Hello,
    
Your verification code is: ${data.otp}

This code will expire in 5 minutes. If you did not request this, please ignore this email.

Best regards,
Flight Booking Team`
    });

    msg.ack()
  }
}