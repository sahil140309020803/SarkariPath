import {examCatModel, examModel, QuestionModel} from "../models/ExamModel.js";
import { AI } from "../GenAI/ai.js";

const addExam = async (req, res) => {
    const {CategoryId, Name, Subjects, Topics } = req.body;
    if(!CategoryId || !Name || !Subjects || Subjects.length === 0) {
        return res.json({success: false, message: "All Fields are required"});
    }
    try {
        const category = await examCatModel.findById(CategoryId);
        if(!category) {
            return res.json({success: false, message: "Category not found"});
        }

        const existingExam = await examModel.findOne({Name, Category: CategoryId});
        if(existingExam) {
            return res.json({success: false, message: "Exam already exists"});
        }
        const exam = await new examModel({Name, Category: CategoryId, Subjects, Topics: Topics || {}});
        await exam.save();
        category.Exams.push(exam._id);
        await category.save();
        return res.json({success: true, message: "Exam added successfully", exam});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
}

const getExams = async (req, res) => {
    const {categoryId} = req.params;
    if(!categoryId) {
        return res.json({success: false, message: "Category ID is required"});
    }
    try {
        const exams = await examModel.find({Category: categoryId}).populate('Category', 'Name Description');
        return res.json({success: true, exams});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
}

const deleteExam = async (req, res) => {
    const {examId} = req.params;
    if(!examId) {
        return res.json({success: false, message: "Exam ID is required"});
    }
    try {
        const exam = await examModel.findById(examId);
        if(!exam) {
            return res.json({success: false, message: "Exam not found"});
        }
        const category = await examCatModel.findById(exam.Category);
        if(category) {
            category.Exams.pull(exam._id);
            await category.save();
        }
        await examModel.findByIdAndDelete(examId);
        return res.json({success: true, message: "Exam deleted successfully"});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
}

const editExam = async (req, res) => {
    const {examId} = req.params;
    const {Name, Subjects, Topics} = req.body;
    if(!examId || !Name || !Subjects || Subjects.length === 0) {
        return res.json({success: false, message: "Exam Name and Subjects are required"});
    }
    try {
        const exam = await examModel.findById(examId);
        if(!exam) return res.json({success: false, message: "Exam not found"});
        exam.Name = Name;
        exam.Subjects = Subjects;
        if(Topics !== undefined) exam.Topics = Topics;
        await exam.save();
        return res.json({success: true, message: "Exam updated successfully", exam});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
}

const getSubjectTopics = async (req, res) => {
    const {examId, subject} = req.params;
    if(!examId || !subject) {
        return res.json({success: false, message: "Exam ID and Subject are required"});
    }
    try {
        // Fetch topics stored natively on the exam model
        const exam = await examModel.findById(examId);
        const storedTopics = (exam && exam.Topics && exam.Topics[subject]) ? exam.Topics[subject] : [];
        
        // Return ONLY the officially curated topics stored in the database
        const finalTopics = storedTopics.filter(t => t && t.trim() !== "");
        
        return res.json({success: true, topics: finalTopics});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
}

const generateTopicsViaAI = async (req, res) => {
    const { examName, subjectName } = req.body;
    if(!examName || !subjectName) {
        return res.json({success: false, message: "Exam Name and Subject Name are required"});
    }
    try {
        const prompt = `You are a curriculum expert. Provide a comprehensive list of specific academic or professional topics covered under the subject '${subjectName}' for the '${examName}' exam based on the latest 2025 syllabus. 
        Rules: 
        1. Return ONLY a valid JSON array of strings containing the topic titles.
        2. Do not include introductory text, markdown formatting blocks (like \`\`\`json), or markdown tags. Just pure valid JSON array.
        3. Aim to provide between 5 to 15 key topics.`;
        
        const result = await AI.generateContent(prompt);
        let aiResponse = result.response.candidates.at(0).content.parts.at(0).text;
        
        // Clean potential markdown tags if AI disobeys
        aiResponse = aiResponse.replace(/```json\n?|```/g, "").trim();
        
        const parsedData = JSON.parse(aiResponse);
        
        if(Array.isArray(parsedData)) {
            return res.json({ success: true, topics: parsedData });
        } else {
            return res.json({ success: false, message: "AI returned invalid format." });
        }
    } catch(err) {
        return res.json({ success: false, message: err.message });
    }
}

const generateSubjectsViaAI = async (req, res) => {
    const { examName } = req.body;
    if(!examName || examName.trim() === '') {
        return res.json({success: false, message: "Exam Name is required to generate subjects"});
    }
    try {
        const prompt = `You are a curriculum expert. Provide a comprehensive list of the core subjects covered in the '${examName}' exam based on the latest 2025 syllabus.
        Rules: 
        1. Return ONLY a valid JSON array of strings containing the subject names.
        2. Do not include introductory text, markdown formatting blocks (like \`\`\`json), or markdown tags. Just pure valid JSON array.
        3. Keep the subject names clean, standard, and easy to read. Aim for 3 to 8 key subjects.`;
        
        const result = await AI.generateContent(prompt);
        let aiResponse = result.response.candidates.at(0).content.parts.at(0).text;
        
        // Clean potential markdown tags if AI disobeys
        aiResponse = aiResponse.replace(/```json\n?|```/g, "").trim();
        
        const parsedData = JSON.parse(aiResponse);
        
        if(Array.isArray(parsedData)) {
            return res.json({ success: true, subjects: parsedData });
        } else {
            return res.json({ success: false, message: "AI returned invalid format." });
        }
    } catch(err) {
        return res.json({ success: false, message: err.message });
    }
}

const generateQuestionCountsViaAI = async (req, res) => {
    try {
        const { examName, subjects } = req.body;
        if (!examName || !subjects || !subjects.length) {
            return res.status(400).json({ success: false, message: "Exam name and subjects are required" });
        }

        const prompt = `You are an expert exam setter and syllabus analyzer for Indian competitive exams.
I am creating a full mock test specifically for the "${examName}" exam. 

Task:
1. Access your knowledge of the LATEST OFFICIAL SYLLABUS and EXAM PATTERN for "${examName}".
2. Determine the exact, realistic standard total number of questions in a real full examination (e.g., 100 questions for HSSC CET, 100 for SSC CGL Tier 1, etc.).
3. Based on the official weightage, assign the exact number of questions to each of the following subjects so that their sum perfectly matches the total standard mock test size.

Subjects Provided: ${subjects.join(', ')}

Strict Constraints:
- Return ONLY a valid JSON object mapping the exact subject name string to its integer question count.
- Do NOT include any introductory text, markdown formatting blocks (like \`\`\`json), or HTML tags. Just the pure valid JSON Object.
- If a subject provided is not perfectly matching standard syllabus naming, intelligently map it to its closest official section's weightage.
- Ensure the overall sum reflects a real mock test for this exact exam.
Example: {"General Knowledge": 25, "Mathematics": 50}`;
        
        const result = await AI.generateContent(prompt);
        let aiResponse = result.response.candidates.at(0).content.parts.at(0).text;
        aiResponse = aiResponse.replace(/```json\n?|```/g, "").trim();
        
        const parsedData = JSON.parse(aiResponse);
        if(typeof parsedData === 'object' && !Array.isArray(parsedData)) {
            return res.json({ success: true, countsMap: parsedData });
        } else {
            return res.json({ success: false, message: "AI returned invalid format." });
        }
    } catch(err) {
        return res.json({ success: false, message: err.message });
    }
}

export {addExam, getExams, deleteExam, editExam, getSubjectTopics, generateTopicsViaAI, generateSubjectsViaAI, generateQuestionCountsViaAI};