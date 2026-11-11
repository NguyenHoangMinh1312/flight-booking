import express from "express"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import { errorHandler, NotFoundError, currentUser } from "@mint1312-flight-booking/common"
import { customerSearchOrderRouter } from "./routes/customer-search-orders"
import { newOrderRouter } from "./routes/new"
import { cancelOrderRouter } from "./routes/cancel-order"
import { showOrderRouter } from "./routes/show"
import { managerSearchOrderRouter } from "./routes/manager-search-orders"


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

app.use(customerSearchOrderRouter)
app.use(managerSearchOrderRouter)
app.use(newOrderRouter)
app.use(cancelOrderRouter)
app.use(showOrderRouter)


app.all("/{*splat}", () => { throw new NotFoundError() })

app.use(errorHandler)

export { app }