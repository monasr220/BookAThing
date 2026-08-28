import mongoose from "mongoose";
import DataBaseError from "../exceptions/DataBaseError.js"; 

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connection successful.");

    } catch (error) {
        
        
        const dbError = new DataBaseError(
            `Database connection failed: ${error.message}`, 
            process.env.MONGO_URI
        );
        
        
        console.error(dbError.stack);
        
        process.exit(1);
    }
};

export default connectDB;
