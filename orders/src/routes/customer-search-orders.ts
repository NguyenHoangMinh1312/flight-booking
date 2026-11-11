import { requireAuth } from "@mint1312-flight-booking/common"
import express from "express"
import { customerSearchOrdersController } from "../controllers/customer-search-orders-controller"

const router = express.Router()

router.get(
  "/api/orders",
  requireAuth,
  customerSearchOrdersController
)

export { router as customerSearchOrderRouter }