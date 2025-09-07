import express  from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app=express()

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))
app.use(express.json({extended:true,limit:"50kd"}))
app.use(cookieParser({limit:"50kd"}))
app.use(express.static('public'))


//Router
import UserRouter from "./routes/user.Router.js"

app.use("/users",UserRouter)



export {app}