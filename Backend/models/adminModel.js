import mongoose from "mongoose";
import { usersDbConnection } from "../config/mongo_config.js";

const adminSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
}, {
    timestamps: true,
    collection: 'admin'
});

const adminModel = usersDbConnection.models.Admin || usersDbConnection.model('admin', adminSchema);
export default adminModel;