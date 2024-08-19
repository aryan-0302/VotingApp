import express from "express"
const app=express()

import dotenv from "dotenv"
dotenv.config();
const PORT=process.env.PORT || 4000

// middleware
app.use(express.json());

// routes
import userRoute from "./routes/userRoute.js";
app.use('/api/v1',userRoute)
import candidatesRoute from "./routes/candidatesRoute.js"
app.use('/api/v1',candidatesRoute)

app.get("/",(req,res)=>{
    res.send('<h1>This is home page</h1>')
})

// activate
app.listen(PORT,()=>{
    console.log(`App is listening at port.3000`);
});

import dbConnect from "./database/db.js";
dbConnect();