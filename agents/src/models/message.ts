import mongoose from "mongoose"

export interface MessageAttrs {
  role: "user" | "assistant" | "system" | "tool"
  content?: string
  tool_call_id?: string
  tool_calls?: Array<{
    id: string
    type: "function"
    function: {
      name: string
      arguments: string
    }
  }>
}

export const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system", "tool"],
      required: true,
    },
    content: {
      type: String,
      required: false, // Must be optional for assistant tool calls
      default: "",
    },
    tool_call_id: {
      type: String,
      required: false,
    },
    tool_calls: {
      type: mongoose.Schema.Types.Mixed, // Stores OpenAI tool call objects
      required: false,
    },
  },
  {
    _id: false,
    timestamps: { createdAt: true, updatedAt: false }
  }
)