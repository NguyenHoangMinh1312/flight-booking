import express, { Request, Response } from "express"
import { currentUser, NotFoundError, requireAuth, requireManager } from "@mint1312-flight-booking/common"
import { User } from "../models/user"

const router = express.Router()

router.get(
  "/api/users/:id",
  currentUser,
  requireAuth,
  requireManager,
  async (req: Request, res: Response) => {
    // find the user 
    const user = await User.findById(req.params.id)

    if (!user || !user.isVerified)
      throw new NotFoundError()

    res.send({
      id: user.id,
      email: user.email
    })
  }
)

export { router as showUserRouter }