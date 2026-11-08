import Queue from "bull"
import { EmailMessage, IEmailService } from "../services/send-email-interface"
import { ResendEmailService } from "../services/resend-email-service"

export class EmailSendWorker {
  private emailService: IEmailService
  private queue: Queue.Queue<EmailMessage>

  constructor(emailService: IEmailService, queue: Queue.Queue) {
    this.emailService = emailService
    this.queue = queue
    this.queue.process(async (job) => { await this.emailService.send(job.data) })
  }

  public async add(message: EmailMessage) {
    await this.queue.add(message, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000
      }
    })
  }
}

const resendEmailService = new ResendEmailService(
  process.env.RESEND_API_KEY || " ",
  'Flight Booking <noreply@flight-booking.shop>'
)

const queue = new Queue<EmailMessage>("email:send", {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
})

export const emailSendWorker = new EmailSendWorker(resendEmailService, queue)