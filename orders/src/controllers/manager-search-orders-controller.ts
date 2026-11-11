import { OrderStatus } from "@mint1312-flight-booking/common"
import { Request, Response } from "express"
import { searchOrders } from "../services/search-orders-service"

type ReqQuery = {
  userId: string | undefined
  createdDate: string | undefined,
  status: OrderStatus | undefined,
  page: string | undefined,
  limit: string | undefined
}

export const managerSearchOrdersController = async (
  req: Request<any, any, any, ReqQuery>,
  res: Response
) => {
  const { userId, createdDate, status, page, limit } = req.query

  const { orders, total } = await searchOrders(
    userId,
    createdDate,
    status,
    Number(page) || 1,
    Number(limit) || 10
  )

  res.send({ orders, total })
}