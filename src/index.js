import dotenv from 'dotenv'
import { connectDB } from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path:"./.env"
});


const PORT=process.env.PORT || 8000;
connectDB()
.then(()=>{
   app.listen(PORT,()=>{
    console.log(`sever is runnig on PORT: ${PORT}`)
   })
})
.catch((err)=>{
    console.log(err)
})




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