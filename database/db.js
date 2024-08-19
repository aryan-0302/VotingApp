import mongoose from "mongoose";
import dotenv from "dotenv";

// Ensure dotenv is loaded
dotenv.config();

const dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("DB connected successfully");
    })
    .catch((err) => {
        console.error("DB connection issue");
        console.error(err);
        process.exit(1);
    });
};

export default dbConnect;
