import { Request, Response } from "express"
import { User } from "../models/user"
import { NotFoundError } from "@mint1312-flight-booking/common"

type ReqParams = {
  id: string
}

export const showController = async (
  req: Request<ReqParams>,
  res: Response
) => {
  const user = await User.findById(req.params.id)

  if (!user || !user.isVerified)
    throw new NotFoundError()

  res.send({
    id: user.id,
    email: user.email
  })
}