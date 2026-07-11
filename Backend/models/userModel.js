import mongoose from "mongoose";
import { usersDbConnection } from "../config/mongo_config.js";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    emailVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    profilePicture: { type: String }
}, {
    timestamps: true,
    collection: 'users'
});

const userModel = usersDbConnection.models.user || usersDbConnection.model('User', userSchema);

export default userModel;