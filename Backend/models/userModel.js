import mongoose from "mongoose";
import { usersDbConnection } from "../config/mongo_config.js";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    testHistory: [
        {
            submissionId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            testId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            examId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            status: { type: String, enum: ['Paused', 'Completed'], required: true },
            title: { type: String, required: true },
            score: { type: Number, required: true },
            maxPossibleScore: { type: Number, required: true },
            accuracy: { type: Number, required: true },
            attemptedAt: { type: Date, required: true },
        }
    ],
    syllabusProgress: [
        {
            examId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'exams',
                required: true
            },
            completedTopics: [{ type: String }]
        }
    ]
}, {
    timestamps: true,
    collection: 'users'
});

const userModel = usersDbConnection.models.user || usersDbConnection.model('User', userSchema);

export default userModel;