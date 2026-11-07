import { requireAuth } from "@mint1312-flight-booking/common"
import express from "express"
import { searchOrdersController } from "../controllers/search-orders-controller"

const router = express.Router()

router.get(
  "/api/orders",
  requireAuth,
  searchOrdersController
)

export { router as indexOrderRouter }