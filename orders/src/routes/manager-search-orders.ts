import { requireAuth, requireManager } from "@mint1312-flight-booking/common"
import express from "express"
import { managerSearchOrdersController } from "../controllers/manager-search-orders-controller"
const router = express.Router()

router.get(
  "/api/manager/orders",
  requireAuth,
  requireManager,
  managerSearchOrdersController
)

export { router as managerSearchOrderRouter }