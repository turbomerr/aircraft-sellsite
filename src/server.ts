import express from "express"
import {connectDB} from "./config/db.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import {errorHandler} from "./middleware/errorHandler.js"
import authRouter from "./routes/auth.routes.js"
import aircraftRouter from "./routes/aircraft.routes.js"
import offerRouter from "./routes/offer.route.js"


dotenv.config()

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT =  process.env.PORT || 5001;

app.use("/api", authRouter)
app.use("/api", aircraftRouter)
app.use("/api", offerRouter)
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