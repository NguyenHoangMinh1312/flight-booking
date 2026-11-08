import { Listener, UserOtpRequestedEvent, Subjects } from "@mint1312-flight-booking/common"
import { JsMsg } from "nats"
import { queueGroupName } from "./queue-group-name"
import { emailSendWorker } from "../../workers/email-send-worker"

export class UserOtpRequestedListener extends Listener<UserOtpRequestedEvent> {
  readonly subject = Subjects.UserOtpRequested
  queueGroupName = queueGroupName

  async onMessage(data: UserOtpRequestedEvent["data"], msg: JsMsg) {

    await emailSendWorker.add({
      receiver: data.email,
      subject: "Your Flight Booking Verification Code",
      content: `
    <html>
      <body>
        <h2>Email Verification</h2>

        <p>Hello,</p>

        <p>Your verification code is:</p>

        <h1>${data.otp}</h1>

        <p>
          This code will expire in <strong>5 minutes</strong>.
          If you did not request this, please ignore this email.
        </p>

        <p>
          Best regards,<br />
          Flight Booking Team
        </p>
      </body>
    </html>
  `
    });


    msg.ack()
  }
}