import { Request, Response } from "express";
import { User } from "../models/user";
import { BadRequestError } from "@mint1312-flight-booking/common";
import { createChat } from "../services/create-chat-service";

export const createChatController = async (
  req: Request,
  res: Response
) => {
  // find the user
  const user = await User.findById(req.currentUser?.id)

  if (!user)
    throw new BadRequestError("User not found")

  // create a new chat session
  const chatSession = await createChat(user)

  res.send({ chatSessionId: chatSession.id })
}