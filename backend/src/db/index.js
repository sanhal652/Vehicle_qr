import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB =async ()=>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`MongoDb connected:${connectionInstance.connection.host}`)
       console.log(`✅ ACTUAL DB NAME: ${connectionInstance.connection.name}`);
      // console.log(connectionInstance)
    } catch (error) {
        console.error("Error",error);
        process.exit(1);
    }
}
export default connectDB;