import express from "express"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import { errorHandler, NotFoundError, currentUser } from "@mint1312-flight-booking/common"
import { createFlightRouter } from "./routes/new"
import { showFlightRouter } from "./routes/show"
import { searchFlightsRouter } from "./routes/search-flights"
import { updateFlightRouter } from "./routes/update"
import { showByTicketRouter } from "./routes/show-by-ticket"
import { cancelFlightRouter } from "./routes/cancel-flight"
import { getAirportsRouter } from "./routes/get-airports"

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
app.use(searchFlightsRouter)
app.use(updateFlightRouter)
app.use(cancelFlightRouter)
app.use(getAirportsRouter)

app.all("/{*splat}", () => { throw new NotFoundError() })

app.use(errorHandler)

export { app }