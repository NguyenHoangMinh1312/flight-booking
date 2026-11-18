import mongoose from "mongoose";
import { ChatSession } from "../models/chat-session";
import { FlightBookingAgent } from "../flight-booking-agent";
import { User } from "../models/user";
import { ForbiddenError, NotFoundError } from "@mint1312-flight-booking/common";
import { sliceChatHistory } from "../utils/slice-chat-history";

export const chat = async (
  chatSessionId: string,
  userId: string,
  userMessage: string,
  timezone: string,
  cookie: string | undefined,
) => {
  if (!mongoose.Types.ObjectId.isValid(chatSessionId))
    throw new NotFoundError();

  // fetch the chat history
  const chatSession = await ChatSession.findById(chatSessionId);
  if (!chatSession) throw new NotFoundError();

  if (chatSession.user.toString() !== userId) throw new ForbiddenError();

  // check if user exists
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError();

  // get the recent chat history to avoid context overflow
  const recentHistory = sliceChatHistory(chatSession.history, 10);

  // call the agent
  const agent = new FlightBookingAgent(user.email, user.id, timezone);
  const { response, conversation } = await agent.chat(
    recentHistory,
    userMessage,
    cookie,
  );

  // extract only the new items from this turn (user message + tool calls + assistant reply)
  const newTurnItems = conversation.slice(recentHistory.length);

  // save the chat
  chatSession.set({ history: [...chatSession.history, ...newTurnItems] });
  chatSession.markModified("history");
  await chatSession.save();

  return response;
};
