import { AI } from "../GenAI/ai.js";
import { examModel, MockTestModel, TestSubmissionModel } from "../models/ExamModel.js";
import userModel from "../models/userModel.js";

const getExamDetailsUsingAI = async (req, res) => {
    const exam = req.params?.id;
    try {
        const prompt = `You are an AI assistant specialized in providing information about academic and competitive examinations. Your task is to take an exam name as input and return a single, valid JSON object.
        All details must be as of latest @2025. You can use any website for your help.
        Use their official website for resources.
        You can search on google also to find the info.

        Input: ${exam}

        Rules:
            Your entire response MUST be a raw, valid JSON object. Do not include any introductory text, explanations.

            The JSON object must contain exactly three keys: "Subjects", "About" and "QuesnTimer".

            The value for the "Subjects" key must be a JSON array of array where array[0] must be a icon associated to that subject and array[1] must be a Subject name, listing all subjects included in the {{Exam Name}}. I want only Subject name not any topic inside the subject.
            array[2] must includes all the topic inside this subject, only topic names.
            Icon must be related to the subject, so check it carefully
            Subject names must be in ascending order. I want subject names as per the latest syllabus.
            You can use their official website to get data.

            The value for the "About" key must be a single HTML string styled with Tailwind CSS. This HTML string must contain the following three sections in order:

                About the Exam: 
                    An <h2> heading with the text "About the exam" styled with class="text-2xl font-semibold text-gray-800 mb-4". This is followed by a <p> tag containing a detailed paragraph about the exam, styled with class="text-gray-600 mb-6".
                Exam Pattern: 
                    An <h2> heading with the text "Exam Pattern" styled with class="text-2xl font-semibold text-gray-800 mb-4". This is followed by a complete HTML <table> that accurately describes the exam pattern. Use the following classes for styling:
                    <table>: class="w-full text-left border-collapse mb-6"
                        <th> (table headers): class="bg-gray-100 p-3 font-semibold text-gray-700 border border-gray-300"
                        <td> (table cells): class="p-3 border border-gray-300"

                Eligibility: 
                    An <h2> heading with the text "Eligibility" styled with class="text-2xl font-semibold text-gray-800 mb-4". This is followed by a <p> tag that explains the eligibility criteria (like educational qualifications, age limit, etc.), styled with class="text-gray-600".

            The value for the QuesnTimer must be a pair where pair.first is the number of questions as per the latest syllabus(Only number of questions for full mock test) and pair.second is the time in minutes that should be given for this full mock test as per latest syllabus.
        `;
        const result = await AI.generateContent(prompt);
        const aiResponseText = result.response.candidates.at(0).content.parts.at(0).text;
        const cleanedJsonString = aiResponseText.replace(/```json\n?|```/g, "");

        const parsedData = JSON.parse(cleanedJsonString);

        res.json({ success: true, ...parsedData });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
}

const removeSlug = (text) => {
    return text.replaceAll('-', ' ');
}

const getExamDetails = async (req, res) => {
    const examName = removeSlug(req.params?.examName);
    const userEmail = req.body?.userEmail;
    try {
        const examData = await examModel.findOne({ Name: examName }).populate('MockTests').lean();
        // console.log(examData); 
        if (!examData) {
            return res.json({ success: false, message: "Exam not found" });
        }
        const mockTests = examData.MockTests || [];
        // console.log(mockTests);

        let testHistory = [];
        let syllabusProgress = [];

        if (userEmail) {
            // Fetch test history from TestSubmissionModel
            const submissions = await TestSubmissionModel.find({ 
                userId: userEmail, 
                examId: examData._id 
            })
            .populate('testId', 'Title')
            .sort({ createdAt: -1 })
            .lean();

            if (submissions && submissions.length > 0) {
                testHistory = submissions.map(sub => ({
                    submissionId: sub._id,
                    testId: sub.testId?._id,
                    examId: sub.examId,
                    status: 'Completed',
                    title: sub.testId?.Title || 'Unknown Test',
                    score: sub.totalScore,
                    maxPossibleScore: sub.maxPossibleScore,
                    accuracy: sub.accuracy,
                    attemptedAt: sub.createdAt
                }));
            }

            // Fetch syllabus progress from userModel
            const user = await userModel.findOne({ email: userEmail }).select('syllabusProgress');
            if (user && user.syllabusProgress) {
                const progressEntry = user.syllabusProgress.find(item => item.examId.toString() === examData._id.toString());
                if (progressEntry && progressEntry.completedTopics) {
                    syllabusProgress = progressEntry.completedTopics;
                }
            }
        }

        // console.log(`TestHistory for exam ${examName}: ${testHistory}`);

        res.json({
            success: true,
            ExamName: examData.Name,
            Subjects: examData.Subjects,
            Topics: examData.Topics || {},
            MockTests: mockTests,
            ExamId: examData._id,
            testHistory,
            syllabusProgress
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
}

export { getExamDetailsUsingAI, getExamDetails };