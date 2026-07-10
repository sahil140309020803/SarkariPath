import userModel from "../models/userModel.js";
import userStatisticsModel from "../models/userStatisticsModel.js";
import { examModel } from "../models/ExamModel.js";

export const updateSyllabusProgress = async (req, res) => {
    try {
        const { userEmail, examId, topicName } = req.body;
        
        if (!examId || !topicName) {
            return res.json({ success: false, message: "examId and topicName are required" });
        }

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const exam = await examModel.findById(examId);
        if (!exam) {
            return res.json({ success: false, message: "Exam not found" });
        }

        // Find the subject for topicName inside the exam.Topics object
        let subjectName = "General";
        if (exam.Topics && typeof exam.Topics === 'object') {
            for (const [subjectKey, topicsList] of Object.entries(exam.Topics)) {
                if (Array.isArray(topicsList) && topicsList.includes(topicName)) {
                    subjectName = subjectKey;
                    break;
                }
            }
        }

        let stats = await userStatisticsModel.findOne({ userId: user._id });
        if (!stats) {
            stats = new userStatisticsModel({
                userId: user._id,
                testsAttempted: 0,
                averageScore: 0,
                currentStreak: 0,
                longestStreak: 0,
                studyHistory: [],
                syllabusProgress: []
            });
        }

        let examEntry = stats.syllabusProgress.find(p => p.examId.toString() === examId);
        if (!examEntry) {
            examEntry = {
                examId: exam._id,
                examName: exam.Name,
                progress: [
                    {
                        subjectName,
                        completedTopics: [topicName]
                    }
                ],
                updatedAt: new Date()
            };
            stats.syllabusProgress.push(examEntry);
        } else {
            let subjectEntry = examEntry.progress.find(s => s.subjectName === subjectName);
            if (!subjectEntry) {
                subjectEntry = {
                    subjectName,
                    completedTopics: [topicName]
                };
                examEntry.progress.push(subjectEntry);
            } else {
                const topicIndex = subjectEntry.completedTopics.indexOf(topicName);
                if (topicIndex === -1) {
                    subjectEntry.completedTopics.push(topicName);
                } else {
                    subjectEntry.completedTopics.splice(topicIndex, 1);
                }
            }
            examEntry.updatedAt = new Date();
        }

        await stats.save();
        
        // Flatten completed topics across all subjects to return to frontend
        const updatedExamEntry = stats.syllabusProgress.find(p => p.examId.toString() === examId);
        const completedTopicsList = updatedExamEntry.progress.reduce((acc, sub) => {
            if (sub.completedTopics) {
                acc.push(...sub.completedTopics);
            }
            return acc;
        }, []);

        return res.json({ 
            success: true, 
            message: "Progress updated", 
            completedTopics: completedTopicsList 
        });

    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}
