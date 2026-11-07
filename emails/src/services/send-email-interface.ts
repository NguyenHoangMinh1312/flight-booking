export type EmailMessage = {
  receiver: string,
  subject: string,
  content: string
}

export interface IEmailService {
  send(message: EmailMessage): Promise<void>
}