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
  const { data, error } = await emailClient.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: [job.data.receiver],
    subject: job.data.subject,
    html: job.data.content
  })

  if (error) {
    return console.error({ error });
  }
})

export { emailSendQueue }