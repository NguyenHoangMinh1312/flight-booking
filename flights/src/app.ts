import express from "express"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import { errorHandler, NotFoundError, currentUser } from "@mint1312-flight-booking/common"
import { createFlightRouter } from "./routes/new"
import { showFlightRouter } from "./routes/show"
import { indexFlightRouter } from "./routes/index"
import { updateFlightRouter } from "./routes/update"
import { showByTicketRouter } from "./routes/show-by-ticket"
import { deleteFlightRouter } from "./routes/delete"

const app = express()
app.set("trust proxy", true)
app.use(json())
app.use(cookieSession({
  signed: false,
  httpOnly: true,
  secure: false,   // in deployment, turn it to true 
  // sameSite: "none",   // uncomment this line if deployment
}));

app.use(currentUser)

app.use(createFlightRouter)
app.use(showByTicketRouter)
app.use(showFlightRouter)
app.use(indexFlightRouter)
app.use(updateFlightRouter)
app.use(deleteFlightRouter)

app.all("/{*splat}", () => { throw new NotFoundError() })

app.use(errorHandler)

export { app }