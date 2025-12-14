import {examCatModel, examModel} from "../models/ExamModel.js";

const addExam = async (req, res) => {
    const {CategoryId, Name, Subjects } = req.body;
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
        const exam = await new examModel({Name, Category: CategoryId, Subjects});
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

export {addExam, getExams, deleteExam};