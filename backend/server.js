import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true
    }
));
app.use(cookieParser());

connectDB().then(
    app.listen(PORT,()=>{
        console.log("Server Running");
    })
);

//router import

import userRouter from "./routes/userRoutes.js"

//routes

app.use("/api/users",userRouter);