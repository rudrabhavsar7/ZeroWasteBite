import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import { startDonationExpiryScheduler } from "./jobs/expireDonations.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true
    }
));
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({
    extended:true, limit:"16kb"
}))
app.use(cookieParser());

connectDB().then(() => {
    startDonationExpiryScheduler({ intervalMs: 60 * 1000 });
    app.listen(PORT, () => {
        console.log("Server Running");
    });
});

//router import

import userRouter from "./routes/userRoutes.js"
import modelRouter from "./routes/modelRoutes.js"
import donationRouter from "./routes/donationRoutes.js"
import volunteerRouter from "./routes/volunteerRoutes.js"
import ngoRouter from "./routes/ngoRoutes.js"

//routes

app.use("/api/users",userRouter);
app.use("/api/model/predict",modelRouter);
app.use("/api/donation",donationRouter);
app.use("/api/volunteer",volunteerRouter);
app.use("/api/ngo",ngoRouter);