import { Request, Response } from "express"
import { cancelFlight } from "../services/cancel-flight-service"

type ReqParams = {
  id: string
}

export const cancelFlightController = async (
  req: Request<ReqParams>,
  res: Response
) => {
  await cancelFlight(req.params.id)

  res.send({ message: "Cancellation is under process" })
}