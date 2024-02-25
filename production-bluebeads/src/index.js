import connectDB from "./db/index.js";
import app from "./app.js";
import dotenv from "dotenv"

dotenv.config();

connectDB()
.then(()=>{ app.listen(process.env.PORT, ()=>{ console.log("started listening on : ",process.env.PORT);}) })
.catch((error)=>{console.log("failed to connect database. Error is : ",error)})