import {examCatModel, examModel} from "../models/ExamModel.js";

const addCategory = async (req, res) => {
    const {Name, Description} = req.body;
    if(!Name || !Description) {
        return res.json({success: false, message: "All Fields are required"});
    }
    try {
        const existingCategory = await examCatModel.findOne({Name});
        if(existingCategory) {
            return res.json({success: false, message: "Category already exists"});
        }
        const category = await new examCatModel({Name, Description});
        await category.save();
        return res.json({success: true, message: "Category added successfully", category});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await examCatModel.find({}).populate('Exams');
        return res.json({success: true, categories});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
};

const deleteCategory = async (req, res) => {
    const {categoryId} = req.params;
    if(!categoryId) {
        return res.json({success: false, message: "Category ID is required"});
    }
    try {
        const category = await examCatModel.findByIdAndDelete(categoryId);
        if(!category) {
            return res.json({success: false, message: "Category not found"});
        }
        await examModel.deleteMany({Category: categoryId});
        await examCatModel.findByIdAndDelete(categoryId);
        return res.json({success: true, message: "Category and associated exams deleted successfully"});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
};

const editCategory = async (req, res) => {
    const {categoryId} = req.params;
    const {Name, Description} = req.body;
    if(!categoryId || !Name || !Description) {
        return res.json({success: false, message: "Name and Description are required"});
    }
    try {
        const category = await examCatModel.findById(categoryId);
        if(!category) return res.json({success: false, message: "Category not found"});
        category.Name = Name;
        category.Description = Description;
        await category.save();
        return res.json({success: true, message: "Category updated successfully", category});
    } catch(err) {
        return res.json({success: false, message: err.message});
    }
};

export {addCategory, getCategories, deleteCategory, editCategory};