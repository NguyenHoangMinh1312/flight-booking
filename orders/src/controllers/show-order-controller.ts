import { BadRequestError } from "@mint1312-flight-booking/common"
import { Request, Response } from "express"
import { showOrder } from "../services/show-order-service"

type ReqParams = {
  orderId: string
}

export const showOrderController = async (
  req: Request<ReqParams>,
  res: Response
) => {
  const orderId = req.params.orderId
  const userId = req.currentUser?.id
  const userRole = req.currentUser?.role

  if (!userId)
    throw new BadRequestError("User ID not provided")

  if (!userRole)
    throw new BadRequestError("User role not provided")

  const order = await showOrder(orderId, userId, userRole)

  res.send(order)
}