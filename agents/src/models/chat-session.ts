import mongoose from "mongoose"
import { UserDoc } from "./user"
import { messageSchema, MessageAttrs } from "./message"

// Properties required to create a new ChatSession
interface ChatSessionAttrs {
  user: UserDoc
  conversation?: MessageAttrs[]
}

// Properties that a ChatSession model has
interface ChatSessionModel extends mongoose.Model<ChatSessionDoc> {
  build(attrs: ChatSessionAttrs): ChatSessionDoc
}

// Properties that a ChatSession document has
export interface ChatSessionDoc extends mongoose.Document {
  id: string
  user: UserDoc
  conversation: MessageAttrs[]
  createdAt: Date
  updatedAt: Date
}

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    conversation: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id
      },
    },
  }
)

chatSessionSchema.statics.build = (attrs: ChatSessionAttrs) => {
  return new ChatSession(attrs)
}

const ChatSession = mongoose.model<ChatSessionDoc, ChatSessionModel>(
  "ChatSession",
  chatSessionSchema
)

export { ChatSession }