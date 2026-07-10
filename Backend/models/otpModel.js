import mongoose from "mongoose";
import { usersDbConnection } from "../config/mongo_config.js";

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // 5 minutes TTL
});

const otpModel = usersDbConnection.models.otp || usersDbConnection.model('Otp', otpSchema);

export default otpModel;
