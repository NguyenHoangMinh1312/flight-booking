import { OrderStatus } from "@mint1312-flight-booking/common"
import { QueryFilter } from "mongoose"
import { Order, OrderDoc } from "../models/order"

export const searchOrders = async (
  userId: string,
  createdDate: string | undefined,
  status: OrderStatus | undefined
) => {
  // build the filter query
  const query: QueryFilter<OrderDoc> = {}

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
  const orders = await Order.find({
    userId,
    ...query
  })
    .populate("ticket")
    .sort({ "createdAt": -1 })

  return orders
}