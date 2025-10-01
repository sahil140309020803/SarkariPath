import mongoose from "mongoose";

export const usersDbConnection = mongoose.createConnection(process.env.USER_MONGODB_URI);
export const examDbConnection = mongoose.createConnection(process.env.EXAM_MONGODB_URI);

const connectMongoDB = async () => {
    
    try {
        usersDbConnection;
        console.log("Connected to User Database");
        examDbConnection;
        console.log("Connected to Exam Database");
    } catch(err) {
        console.log("Error connecting to MongoDB:", err.message);
    }
}

export default connectMongoDB;