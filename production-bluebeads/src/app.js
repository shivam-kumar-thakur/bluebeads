import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import ngoRouter from "./routers/ngo.routes.js"
import generalRouter from "./routers/general.routes.js" 
import campRouter from "./routers/camp.routes.js"
import userRouter from "./routers/users.routes.js"

//routes declaration
app.use("/v1/user", userRouter)
app.use("/v1/ngo", ngoRouter)
app.use("/v1/camp", campRouter)
app.use("/v1/normal", generalRouter)

// http://localhost:8000/api/v1/register


export default app