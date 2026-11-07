import { Resend } from "resend";
import { IEmailService, EmailMessage } from "./send-email-interface";

export class ResendEmailService implements IEmailService {
  private client: Resend
  private senderAddress: string

  constructor(apiKey: string, senderAddress: string) {
    this.client = new Resend(apiKey)
    this.senderAddress = senderAddress
  }

  async send(message: EmailMessage) {
    const { data, error } = await this.client.emails.send({
      from: this.senderAddress,
      to: [message.receiver],
      subject: message.subject,
      html: message.content
    })

    if (error) {
      throw new Error(`Resend email delivery failed: ${error.message}`);
    }
  }
}