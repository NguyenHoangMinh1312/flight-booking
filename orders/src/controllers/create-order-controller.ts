import { Request, Response } from "express"
import { createOrder } from "../services/create-order-service"
import { BadRequestError } from "@mint1312-flight-booking/common"

type ReqBody = {
  ticketId: string
}

export const createhOrderController = async (
  req: Request<any, any, ReqBody>,
  res: Response
) => {
  const userId = req.currentUser?.id

  if (!userId)
    throw new BadRequestError("User ID not provided")

  const order = await createOrder(req.body.ticketId, userId)

  res.status(201).send(order)
}