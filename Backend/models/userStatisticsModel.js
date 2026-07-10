import mongoose from 'mongoose';
import { usersDbConnection } from '../config/mongo_config.js';

const userStatisticsSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true
    },
    testsAttempted: { 
        type: Number, 
        default: 0 
    },
    averageScore: { 
        type: Number, 
        default: 0 
    },
    currentStreak: { 
        type: Number, 
        default: 0 
    },
    longestStreak: { 
        type: Number, 
        default: 0 
    },
    dailyStatistics: [
        {
            date: { type: String, required: true }, // Format "YYYY-MM-DD"
            testsAttempted: { type: Number, default: 0 },
            studyMinutes: { type: Number, default: 0 }
        }
    ],
    syllabusProgress: [
        {
            examId: { type: mongoose.Schema.Types.ObjectId, required: true },
            examName: { type: String, required: true },
            progress: [
                {
                    subjectName: { type: String, required: true },
                    completedTopics: [{ type: String }]
                }
            ],
            updatedAt: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true,
    collection: 'userstatistics'
});

// Explicitly define required indexes
userStatisticsSchema.index({ "syllabusProgress.examId": 1 });

const userStatisticsModel = usersDbConnection.models.UserStatistics || usersDbConnection.model('UserStatistics', userStatisticsSchema);

export default userStatisticsModel;
