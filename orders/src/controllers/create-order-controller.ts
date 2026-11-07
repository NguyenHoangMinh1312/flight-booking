import { Request, Response } from "express"
import { createOrder } from "../services/create-order-service"
import { BadRequestError } from "@mint1312-flight-booking/common"

export const createhOrderController = async (
  req: Request,
  res: Response
) => {
  const { ticketId } = req.body
  const userId = req.currentUser?.id

  if (typeof ticketId !== "string")
    throw new BadRequestError("Invalid ticket ID")

  if (!userId)
    throw new BadRequestError("User ID not provided")

  const order = await createOrder(ticketId, userId)

  res.status(201).send(order)
}