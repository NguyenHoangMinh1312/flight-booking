import express from "express"
import { json } from "body-parser"
import cookieSession from "cookie-session"
import { currentUserRouter } from "./routes/current-user"
import { signinRouter } from "./routes/signin"
import { signoutRouter } from "./routes/signout"
import { signupRouter } from "./routes/signup"
import { errorHandler, NotFoundError } from "@mint1312-flight-booking/common"
import { showUserRouter } from "./routes/show"
import { verifyOtpRouter } from "./routes/verify-otp"
import { resendOtpRouter } from "./routes/resend-otp"

const app = express()
app.set("trust proxy", true);
app.use(json())
app.use(cookieSession({
  signed: false,
  httpOnly: true,
  secure: false,   // in deployment, turn it to true 
  // sameSite: "none",   // uncomment this line if deployment
}));

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)
app.use(showUserRouter)
app.use(verifyOtpRouter)
app.use(resendOtpRouter)

app.all("/{*splat}", () => { throw new NotFoundError() })

app.use(errorHandler)

export { app }