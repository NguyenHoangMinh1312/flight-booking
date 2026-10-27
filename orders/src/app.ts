import express from "express"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import { errorHandler, NotFoundError, currentUser } from "@mint1312-flight-booking/common"
import { indexOrderRouter } from "./routes"
import { newOrderRouter } from "./routes/new"
import { deleteOrderRouter } from "./routes/delete"
import { showOrderRouter } from "./routes/show"


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

app.use(indexOrderRouter)
app.use(newOrderRouter)
app.use(deleteOrderRouter)
app.use(showOrderRouter)


app.all("/{*splat}", () => { throw new NotFoundError() })

app.use(errorHandler)

export { app }