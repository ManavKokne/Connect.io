import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser"

const app = express();
dotenv.config();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes)

app.get("/",(req, res)=>{
    res.send("Server is Running")
})

app.listen(PORT, ()=>{
    console.log(`Server is Running on Port : ${PORT}`);
    connectDB();
})