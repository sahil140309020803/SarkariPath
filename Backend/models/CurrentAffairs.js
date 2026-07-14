import mongoose from "mongoose";
import { examDbConnection } from "../config/mongo_config.js";

const CurrentAffairsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exams',
        required: false
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    questionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'questions'
    }]
}, {
    timestamps: true,
    collection: 'current_affairs'
});

const CurrentAffairsModel = examDbConnection.models.current_affairs || examDbConnection.model('current_affairs', CurrentAffairsSchema);

export default CurrentAffairsModel;
