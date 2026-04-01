import exp from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import cookieParser from 'cookie-parser'
import { userRoute } from './APIs/UserAPI.js'
import { authorRoute } from './APIs/AuthorAPI.js'
import { adminRoute } from './APIs/AdminAPI.js'
import { commonRouter } from './APIs/CommonAPI.js'
import cors from 'cors'

config()    //process.env

const app = exp()
//add cookie parser middleware
app.use(cookieParser()) 
//use cors middleware
app.use(cors({origin:['https://vercel.com/gundasaideepthis-projects/blog-app'],credentials:true})) //credentials will attach token to header 
//add body parser middleware
app.use(exp.json())


//connect APIs
app.use('/user-api', userRoute)
app.use('/author-api', authorRoute)
app.use('/admin-api', adminRoute)
app.use('/common-api', commonRouter)


//connect to db
const connectDB = async () => {
    try {
        await connect(process.env.DB_URL)
        console.log("DB connection succesfull")
        // start http server
        app.listen(process.env.PORT,()=>console.log("server started"))
    } catch (err) {
        console.log("Err in DB connection",err)
    }
}

connectDB()

//dealing with invalid path
app.use((req, res, next) => {
    console.log(req.url)
    res.json({message:`${req.url} is invalid path`})
})

//error handling middleware


app.use((err, req, res, next) => {

    console.log("Error name:", err.name);
    console.log("Error code:", err.code);
    console.log("Full error:", err);

  // mongoose validation error
    if (err.name === "ValidationError") {
    return res.status(400).json({
        message: "error occurred",
        error: err.message,
    });
    }

  // mongoose cast error
    if (err.name === "CastError") {
    return res.status(400).json({
        message: "error occurred",
        error: err.message,
    });
    }

    const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
    const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

    if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
        message: "error occurred",
        error: `${field} "${value}" already exists`,
    });
    }

  // ✅ HANDLE CUSTOM ERRORS
    if (err.status) {
    return res.status(err.status).json({
        message: "error occurred",
        error: err.message,
    });
    }

  // default server error
    res.status(500).json({
    message: "error occurred",
    error: "Server side error",
    });
});
/*
app.use((err, req, res, next) => {
  // Mongoose validation error
    if (err.name === "ValidationError") {
    return res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
    });
    }
  // Invalid ObjectId
    if (err.name === "CastError") {
    return res.status(400).json({
        message: "Invalid ID format",
    });
    }
  // Duplicate key
    if (err.code === 11000) {
    return res.status(409).json({
        message: "Duplicate field value",
    });
    }
    res.status(500).json({
    message: "Internal Server Error",
    });
});
app.use((err, req, res, next) => {
    console.log("err:", err)
    res.status(500).json({
        message: "error",
        reason: err.message
    })
})


*/
