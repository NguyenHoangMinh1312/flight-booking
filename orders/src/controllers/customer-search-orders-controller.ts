import { BadRequestError, OrderStatus } from "@mint1312-flight-booking/common"
import { Request, Response } from "express"
import { searchOrders } from "../services/search-orders-service"

type ReqQuery = {
  createdDate: string | undefined,
  status: OrderStatus | undefined,
  page: string | undefined,
  limit: string | undefined
}

export const customerSearchOrdersController = async (
  req: Request<any, any, any, ReqQuery>,
  res: Response
) => {
  const { createdDate, status, page, limit } = req.query
  const userId = req.currentUser?.id

  if (!userId)
    throw new BadRequestError("invalid user ID")

  const { orders, total } = await searchOrders(
    userId,
    createdDate,
    status,
    Number(page) || 1,
    Number(limit) || 10
  )

  res.send({ orders, total })
}