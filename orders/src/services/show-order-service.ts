import { Order } from "../models/order"
import { NotFoundError, UnauthorizedError, UserRole } from "@mint1312-flight-booking/common"

export const showOrder = async (
  orderId: string,
  userId: string,
  userRole: UserRole
) => {
  const order = await Order.findById(orderId).populate("ticket")

  if (!order)
    throw new NotFoundError()

  if (userRole === UserRole.Customer && order.userId !== userId)
    throw new UnauthorizedError()

  return order
}