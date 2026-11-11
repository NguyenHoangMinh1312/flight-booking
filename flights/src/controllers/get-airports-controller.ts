import { Request, Response } from "express"
import { airports } from "../data/seed-airports"

export const getAirportsController = async (
  req: Request,
  res: Response
) => {
  res.send(airports)
}