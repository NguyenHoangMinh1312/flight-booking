import mongoose from "mongoose"
import { ChatSession } from "../models/chat-session"
import { FlightBookingAgent } from "../flight-booking-agent"
import { User } from "../models/user"
import { ForbiddenError, NotFoundError } from "@mint1312-flight-booking/common"

export const chat = async (
  chatSessionId: string,
  userId: string,
  userMessage: string,
  cookie: string | undefined
) => {
  if (!mongoose.Types.ObjectId.isValid(chatSessionId))
    throw new NotFoundError()

  // fetch the chat history
  const chatSession = await ChatSession.findById(chatSessionId)
  if (!chatSession)
    throw new NotFoundError()

  if (chatSession.user.toString() !== userId)
    throw new ForbiddenError()

  // check if user exists
  const user = await User.findById(userId)
  if (!user)
    throw new NotFoundError()

  // call the agent
  const agent = new FlightBookingAgent(user.email, user.id)

  const { response, history } = await agent.chat(chatSession.history, userMessage, cookie)

  // save the chat
  chatSession.set({ history })
  chatSession.markModified("history")
  await chatSession.save()

  return response
}