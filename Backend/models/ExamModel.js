import mongoose from "mongoose";
import { examDbConnection } from "../config/mongo_config.js";

const examCatSchema = new mongoose.Schema({
    icon: {type: String},
    Name: {type: String, required: true, unique: true},
    Description: {type: String, required: true},
    Exams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exams'
    }],
}, {
    timestamps: true,
    collection: 'exam_categories'
});

const examCatModel = examDbConnection.models.exam_categories || examDbConnection.model('exam_categories', examCatSchema);

const examSchema = new mongoose.Schema({
    Name: {type: String, required: true},
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exam_categories',
        required: true
    },
    MockTests: {type: Array},
    Quizzes: {type: Array},
    Subjects: {type: Array, required: true},
}, {
    timestamps: true,
    collection: 'exams'
});

const examModel = examDbConnection.models.exams || examDbConnection.model('exams', examSchema);

export {examCatModel, examModel};