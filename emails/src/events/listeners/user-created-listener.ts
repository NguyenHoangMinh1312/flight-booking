import { Listener, UserCreatedEvent, Subjects } from "@mint1312-flight-booking/common"
import { Message } from "node-nats-streaming"
import { queueGroupName } from "./queue-group-name"
import { User } from "../../models/user"

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  readonly subject = Subjects.UserCreated
  queueGroupName = queueGroupName

  async onMessage(data: UserCreatedEvent["data"], msg: Message) {
    const existingUser = await User.findById(data.id)

    if (existingUser)
      return msg.ack()

    const user = User.build(data)
    await user.save()

    msg.ack()
  }
}