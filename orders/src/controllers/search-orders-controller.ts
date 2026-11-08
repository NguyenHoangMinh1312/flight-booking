import { BadRequestError, OrderStatus } from "@mint1312-flight-booking/common"
import { Request, Response } from "express"
import { searchOrders } from "../services/search-orders-service"

type ReqQuery = {
  createdDate: string | undefined,
  status: OrderStatus | undefined
}

export const searchOrdersController = async (
  req: Request<any, any, any, ReqQuery>,
  res: Response
) => {
  const { createdDate, status } = req.query
  const userId = req.currentUser?.id

  if (!userId)
    throw new BadRequestError("invalid user ID")

  const orders = await searchOrders(
    userId,
    createdDate,
    status
  )

  res.send(orders)
}