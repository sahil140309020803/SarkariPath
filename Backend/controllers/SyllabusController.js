import userModel from "../models/userModel.js";

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

        // Initialize if doesn't exist (for existing users)
        if (!user.syllabusProgress) {
            user.syllabusProgress = [];
        }

        const progressIndex = user.syllabusProgress.findIndex(p => p.examId.toString() === examId);
        
        if (progressIndex === -1) {
            // Exam not found in progress, add it with the topic
            user.syllabusProgress.push({
                examId,
                completedTopics: [topicName]
            });
        } else {
            // Exam found, toggle topic
            const topicIndex = user.syllabusProgress[progressIndex].completedTopics.indexOf(topicName);
            if (topicIndex === -1) {
                user.syllabusProgress[progressIndex].completedTopics.push(topicName);
            } else {
                user.syllabusProgress[progressIndex].completedTopics.splice(topicIndex, 1);
            }
        }

        await user.save();
        
        // Return the updated completed topics for this exam
        const updatedProgress = user.syllabusProgress.find(p => p.examId.toString() === examId);

        return res.json({ 
            success: true, 
            message: "Progress updated", 
            completedTopics: updatedProgress.completedTopics 
        });

    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}
