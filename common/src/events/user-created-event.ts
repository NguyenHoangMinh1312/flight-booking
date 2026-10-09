import { Subjects } from "./subjects"

// couple the data to be sent to ticket:created channel
export interface UserCreatedEvent {
  subject: Subjects.UserCreated
  data: {
    id: string,
    email: string
  }
}