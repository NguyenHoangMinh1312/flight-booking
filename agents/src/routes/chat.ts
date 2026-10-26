import express, { Request, Response } from "express"
import { currentUser, requireAuth } from "@mint1312-flight-booking/common"
import { body } from "express-validator"

const router = express.Router()

router.post(
  "/api/agents/:id",
  [
    body("message")
      .trim()
      .notEmpty()
      .withMessage("You must supply the message content")
  ],
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { message } = req.body
  }
)

export { router as chatRouter }