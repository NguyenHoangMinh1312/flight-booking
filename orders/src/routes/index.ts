import { OrderStatus, requireAuth } from "@mint1312-flight-booking/common"
import express, { Request, Response } from "express"
import { Order, OrderDoc } from "../models/order"
import { QueryFilter } from "mongoose"

const router = express.Router()

router.get(
  "/api/orders",
  requireAuth,
  async (req: Request, res: Response) => {
    const { createdDate, status } = req.query

    // build the filter query
    const query: QueryFilter<OrderDoc> = {}

    if (createdDate && typeof createdDate === "string") {
      const startOfDay = new Date(createdDate)
      startOfDay.setUTCHours(0, 0, 0, 0)

      const endOfDay = new Date(createdDate)
      endOfDay.setUTCHours(23, 59, 59, 999)

      if (!isNaN(startOfDay.getTime()))
        query.createdAt = { $gte: startOfDay, $lte: endOfDay }
    }

    if (status && typeof status === "string")
      query.status = status as OrderStatus

    // apply filter
    const orders = await Order
      .find({ userId: req.currentUser!.id, ...query })
      .populate("ticket")
      .sort({ "createdAt": -1 })

    res.send(orders)
  }
)

export { router as indexOrderRouter }