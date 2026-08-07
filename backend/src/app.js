import cors from "cors"
import cookieParser from "cookie-parser"
import express from "express"

const app=express();

app.use(cors({                  //we mainly use app.use to make any kind of configuration
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))   //to accept json format 
app.use(express.urlencoded({extended:true,limit:"16kb"}))   //to get data from url
app.use(express.static("public"))   //to store images etc. 

app.use(cookieParser())



//routes

import vehicleRouter from "./routes/vehicle.routes.js";

app.use("/api/vehicle",vehicleRouter);
export {app}