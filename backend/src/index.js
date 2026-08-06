import http from "http";
import dotenv from "dotenv";
import connectDB from ".db/index.js";
import {app} from "./app.js";

dotenv.config({
    path:"./.env"
})

connectDB()
.then(()=>{
    const PORT=process.env.PORT || 5000;
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((error)=>{
    console.error("Error connecting to the database:", error);
    process.exit(1);
})