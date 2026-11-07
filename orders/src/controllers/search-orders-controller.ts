import { BadRequestError, OrderStatus } from "@mint1312-flight-booking/common"
import { Request, Response } from "express"
import { searchOrders } from "../services/search-orders-service"

const parseOptionalString = (value: any, field: string) => {
  if (value === undefined)
    return undefined

  if (typeof value !== "string")
    throw new BadRequestError(`Invalid ${field}`)

  return value
}

const parseOrderStatus = (status: any) => {
  status = parseOptionalString(status, "order status")

  if (status === undefined)
    return undefined

  if (!Object.values(OrderStatus).includes(status as OrderStatus))
    throw new BadRequestError("Invalid order status")

  return status as OrderStatus
}

export const searchOrdersController = async (
  req: Request,
  res: Response
) => {
  const { createdDate, status } = req.query
  const userId = req.currentUser?.id

  if (!userId)
    throw new BadRequestError("invalid user ID")

  const orders = await searchOrders(
    userId,
    parseOptionalString(createdDate, "created date"),
    parseOrderStatus(status)
  )

  res.send(orders)
}