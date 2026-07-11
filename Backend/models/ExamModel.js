import mongoose from "mongoose";
import { examDbConnection } from "../config/mongo_config.js";

const examCatSchema = new mongoose.Schema({
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
    Topics: { type: Object, default: {} },
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
    type: { type: String, required: true, enum: ['mock_test', 'quiz'], default: 'mock_test' },
    leaderboard: [
        {
            userId: { type: String, required: true },
            name: { type: String, default: 'Aspirant' },
            score: { type: Number, required: true },
            percentage: { type: Number, required: true },
            timeTaken: { type: Number, required: true },
            submittedAt: { type: Date, default: Date.now }
        }
    ],
    expireAt: { type: Date, index: { expires: 0 } },
}, {
    timestamps: true,
});

MockTestSchema.index({ Title: 1, ExamId: 1 }, { unique: true });

const MockTestModel = examDbConnection.models.mock_tests || examDbConnection.model('mock_tests', MockTestSchema);

const QuizSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    ExamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exams',
        required: true
    },
    NegativeMarks: { type: Number, required: true, default: 0 },
    Difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    Questions: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'questions',
        required: true
    }],
    DurationinMinutes: { type: Number, required: true, default: 20 },
    TotalMarks: { type: Number, required: true, default: 15 },
    expireAt: { type: Date, index: { expires: 0 } },
});

const QuizModel = examDbConnection.models.quizzes || examDbConnection.model('quizzes', QuizSchema);


const TestSubmissionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mock_tests',
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exams', 
        required: true
    },
    responses: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'questions',
                required: true
            },
            subject: { type: String, required: true },
            selectedOptionIndex: { type: Number, default: null }, 
            status: { 
                type: String, 
                enum: ['correct', 'incorrect', 'skipped'], 
                required: true 
            },
            timeSpent: { type: Number, default: 0 }
        }
    ],
    sectionAnalysis: [
        {
            subject: { type: String, required: true },
            score: { type: Number, required: true },
            totalQuestions: { type: Number, required: true },
            correct: { type: Number, required: true },
            incorrect: { type: Number, required: true },
            skipped: { type: Number, required: true },
            timeSpent: { type: Number, required: true },
            accuracy: { type: Number, required: true }
        }
    ],
    totalScore: { type: Number, required: true },
    maxPossibleScore: { type: Number, required: true },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    accuracy: { type: Number, required: true }, 

    timeTaken: { type: Number, required: true },
    isQualified: { type: Boolean, default: false }, 
    expireAt: { type: Date, index: { expires: 0 } },

}, {
    timestamps: true,
    collection: 'test_submissions'
});
TestSubmissionSchema.index({ userId: 1, testId: 1 });

const TestSubmissionModel = examDbConnection.models.test_submissions || examDbConnection.model('test_submissions', TestSubmissionSchema);


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
    },
    expireAt: { type: Date, index: { expires: 0 } },
}, { timestamps: true });

const QuestionModel = examDbConnection.models.questions || examDbConnection.model('questions', QuestionSchema);


export { examCatModel, examModel, MockTestModel, QuizModel, QuestionModel, TestSubmissionModel };