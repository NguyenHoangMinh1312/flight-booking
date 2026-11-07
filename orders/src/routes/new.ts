import { requireAuth, validateRequest } from "@mint1312-flight-booking/common"
import express from "express"
import { body } from "express-validator"
import { createhOrderController } from "../controllers/create-order-controller"

const router = express.Router()

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not().isEmpty()
      .withMessage("ticketId must be provided"),
  ],
  validateRequest,
  createhOrderController
)

export { router as newOrderRouter }