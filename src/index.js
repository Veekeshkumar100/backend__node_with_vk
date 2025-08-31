import dotenv from 'dotenv'
import mongoose from "mongoose";
import express  from 'express';

import { connectDB } from "./db/index.js";

dotenv.config({
    path:"./.env"
});



connectDB()




//  ;(async()=>{
    
//     try {
//         await mongoose.connect(`${process.env.MONGO_URL}/${MONGODB_NAME}`)
//         console.log("DB connected");
//          app.on("error", (error) => console.log(`Error:${error}`));

//          app.listen(process.env.PORT, () => {
//            console.log(`Server started on PORT ${process.env.PORT}`);
//          });

//     } catch (error) {
//         console.log(error);
//         throw new Error("DB connection error")
//     }

// })()