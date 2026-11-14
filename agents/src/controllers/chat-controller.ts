import { Request, Response } from "express";
import { chat } from "../services/chat-service";
import { BadRequestError } from "@mint1312-flight-booking/common";

type ReqParams = {
  chatSessionId: string
}

type ReqBody = {
  userMessage: string
}

export const chatController = async (
  req: Request<ReqParams, any, ReqBody>,
  res: Response
) => {
  const { chatSessionId } = req.params
  const { userMessage } = req.body
  const userId = req.currentUser?.id
  const cookie = req.headers.cookie

  if (!userId)
    throw new BadRequestError("User ID not provided")

  const response = await chat(chatSessionId, userId, userMessage, cookie)

  res.send({ response })
}