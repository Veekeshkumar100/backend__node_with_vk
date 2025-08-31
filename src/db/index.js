import mongoose from "mongoose";
import {MONGODB_NAME} from "../constans.js"


export const connectDB=async()=>{
    try {
      const connection  =  await mongoose.connect(`${process.env.MONGO_URL}/${MONGODB_NAME}`);
    console.log(`DB connected ${connection.connection.host}`);
        
    } catch (error) {
        console.log(`DB connection error: ${error.message}`);
        process.exit(1);
    }
}