import mongoose from "mongoose"
import { UserDoc } from "./user"
import { AgentInputItem } from "@openai/agents"

// Properties required to create a new ChatSession
interface ChatSessionAttrs {
  user: UserDoc
  history?: AgentInputItem[]
}

// Properties that a ChatSession document has
export interface ChatSessionDoc extends mongoose.Document {
  id: string
  user: UserDoc
  history: AgentInputItem[]
  createdAt: Date
  updatedAt: Date
}

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    history: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        return {
          id: ret._id,
          user: ret.user,
          history: ret.history
        }
      }
    }
  }
)

chatSessionSchema.statics.build = (attrs: ChatSessionAttrs) => {
  return new ChatSession(attrs)
}

interface ChatSessionModel extends mongoose.Model<ChatSessionDoc> {
  build(attrs: ChatSessionAttrs): ChatSessionDoc
}

const ChatSession = mongoose.model<ChatSessionDoc, ChatSessionModel>("ChatSession", chatSessionSchema)

export { ChatSession }