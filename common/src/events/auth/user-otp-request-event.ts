import { Subjects } from "../subjects"

// couple the data to be sent to ticket:created channel
export interface UserOtpRequestedEvent {
  subject: Subjects.UserOtpRequested
  data: {
    email: string,
    otp: string
  }
}