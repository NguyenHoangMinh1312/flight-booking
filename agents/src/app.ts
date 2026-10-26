import express from "express"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import { errorHandler, NotFoundError } from "@mint1312-flight-booking/common"
import { createChatSessionRouter } from "./routes/new"
import { chatRouter } from "./routes/chat"

const app = express()
app.set("trust proxy", true);
app.use(json())
app.use(cookieSession({
  signed: false,
  httpOnly: true,
  secure: false,   // if using GCP, turn it to true 
  // sameSite: "none",   // uncomment this line if using GCP
}));

app.use(createChatSessionRouter)
app.use(chatRouter)

app.all("/{*splat}", () => { throw new NotFoundError() })

app.use(errorHandler)

export { app }