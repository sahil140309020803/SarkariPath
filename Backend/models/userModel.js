import mongoose from "mongoose";
import { usersDbConnection } from "../config/mongo_config.js";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
}, {
    timestamps: true,
    collection: 'users'
});

const userModel = usersDbConnection.models.user ||  usersDbConnection.model('User', userSchema);

export default userModel;