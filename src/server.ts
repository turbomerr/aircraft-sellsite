import express from "express"
import {connectDB} from "./config/db.js"
import dotenv from "dotenv"
dotenv.config()
import cookieParser from "cookie-parser";
import {errorHandler} from "./middleware/errorHandler.js"
import authRouter from "./routes/auth.routes.js"
import aircraftRouter from "./routes/aircraft.routes.js"
import offerRouter from "./routes/offer.route.js"
import paymentRouter from "./routes/payment.routes.js"
import { stripeWebhook } from "./controllers/payment.controller.js";


dotenv.config()

const app = express();
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
app.use(express.json());
app.use(cookieParser());

const PORT =  process.env.PORT || 5001;

app.use("/api", authRouter)
app.use("/api", aircraftRouter)
app.use("/api", offerRouter)
app.use("/api", paymentRouter)
app.use(errorHandler)

console.log("Server file started");

const startServer = async() => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log("Server running on port ",PORT);
        })
    } catch (error) {
        console.log("Server failed :", error)
    }
}
startServer();