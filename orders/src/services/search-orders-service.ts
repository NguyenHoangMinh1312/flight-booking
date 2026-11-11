import { OrderStatus } from "@mint1312-flight-booking/common"
import { QueryFilter } from "mongoose"
import { Order, OrderDoc } from "../models/order"

export const searchOrders = async (
  userId: string | undefined,
  createdDate: string | undefined,
  status: OrderStatus | undefined,
  page: number,
  limit: number
) => {
  // build the filter query
  const query: QueryFilter<OrderDoc> = {}

  if (userId) {
    query.userId = userId
  }

  if (createdDate) {
    const startOfDay = new Date(createdDate)
    startOfDay.setUTCHours(0, 0, 0, 0)

    const endOfDay = new Date(createdDate)
    endOfDay.setUTCHours(23, 59, 59, 999)

    query.createdAt = { $gte: startOfDay, $lte: endOfDay }
  }

  if (status)
    query.status = status

  // search orders
  limit = Math.max(0, limit)
  const skip = (page - 1) * limit

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("ticket")
      .sort({ "createdAt": -1 })
      .skip(skip)
      .limit(limit)
    ,
    Order.countDocuments(query)
  ])

  return { orders, total }
}