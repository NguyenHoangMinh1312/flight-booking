import { UserDoc } from "../models/user";
import { ChatSession } from "../models/chat-session";

export const createChat = async (
  user: UserDoc
) => {
  const chatSession = ChatSession.build({ user })
  await chatSession.save()

  return chatSession
}