import Queue from "bull"
import { emailClient } from "../email-client"

interface Payload {
  receiver: string,
  subject: string,
  content: string
}

const emailSendQueue = new Queue<Payload>("email:send", {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
})

emailSendQueue.process(async (job) => {
  await emailClient.sendMail({
    from: process.env.GMAIL_USER,
    to: job.data.receiver,
    subject: job.data.subject,
    text: job.data.content
  })
})

export { emailSendQueue }