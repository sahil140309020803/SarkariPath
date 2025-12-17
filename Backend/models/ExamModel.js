import mongoose from "mongoose";
import { examDbConnection } from "../config/mongo_config.js";

const examCatSchema = new mongoose.Schema({
    icon: { type: String },
    Name: { type: String, required: true, unique: true },
    Description: { type: String, required: true },
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
    Name: { type: String, required: true },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exam_categories',
        required: true
    },
    MockTests: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mock_tests',
    }],
    Quizzes: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quizzes',
    }],
    Subjects: { type: Array, required: true },
}, {
    timestamps: true,
    collection: 'exams'
});

const examModel = examDbConnection.models.exams || examDbConnection.model('exams', examSchema);

const MockTestSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    ExamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exams',
        required: true
    },
    Status: {type: String, required: true, enum: ['Draft', 'Published'], default: 'Draft'},
    Difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    NegativeMarks: { type: Number, default: 0 },
    Structure: [
        {
            Subject: { type: String, required: true },
            QuestionCount: { type: Number, required: true },
        }
    ],
    Questions: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'questions',
        required: true
    }],
    TotalMarks: { type: Number, required: true },
    DurationinMinutes: { type: Number, required: true },
}, {
    timestamps: true,
});

MockTestSchema.index({ Title: 1, ExamId: 1 }, { unique: true });

const MockTestModel = examDbConnection.models.mock_tests || examDbConnection.model('mock_tests', MockTestSchema);

const QuizSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    ExamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exams',
        required: true
    },
    NegativeMarks: { type: Number, required: true, default: 0 },
    Questions: {},
    DurationinMinutes: { type: Number, required: true, default: 20 },
    TotalMarks: { type: Number, required: true },
});

const QuizModel = examDbConnection.models.quizzes || examDbConnection.model('quizzes', QuizSchema);


const QuestionSchema = new mongoose.Schema({
    ExamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exams',
        required: true
    },
    en: {
        Question: { type: String },
        options: [
            {
                text: { type: String },
                isCorrect: { type: Boolean, default: false, index: true }
            }
        ],
        answer: { type: String },
        solution: { type: String },
    },
    hi: {
        Question: { type: String },
        options: [
            {
                text: { type: String },
                isCorrect: { type: Boolean, default: false, index: true }
            }
        ],
        answer: { type: String },
        solution: { type: String },
    },
    Subject: {
        type: String,
        required: true,
        index: true
    },
    Topic: {
        type: String,
        index: true
    },
    Difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard'],
        index: true
    }
}, { timestamps: true });

const QuestionModel = examDbConnection.models.questions || examDbConnection.model('questions', QuestionSchema);


export { examCatModel, examModel, MockTestModel, QuizModel, QuestionModel };