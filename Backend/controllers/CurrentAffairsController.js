import CurrentAffairsModel from '../models/CurrentAffairs.js';
import { QuestionModel, examModel } from '../models/ExamModel.js';
import { processCurrentAffairsPDF } from '../services/currentAffairs/CurrentAffairsService.js';
import mongoose from 'mongoose';

// Upload and Parse PDF
export const uploadCurrentAffairsPDF = async (req, res) => {
  const { date, socketId } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ success: false, message: "PDF file is required" });
  }
  if (!date) {
    return res.status(400).json({ success: false, message: "date is required" });
  }

  try {
    const io = req.app.get('socketio');
    
    // Process PDF and generate preview questions
    const questions = await processCurrentAffairsPDF(req.file.buffer, io, socketId);
    
    return res.status(200).json({
      success: true,
      message: "PDF parsed and questions generated successfully",
      questions
    });
  } catch (error) {
    console.error("[CurrentAffairsController] Upload failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Save generated questions to DB and create CurrentAffairs metadata document
export const saveCurrentAffairsQuestions = async (req, res) => {
  const { date, questions } = req.body;

  if (!date || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ success: false, message: "date and questions are required" });
  }

  try {
    // Find a default ExamId to satisfy database requirements (since CA is global for all exams)
    const firstExam = await examModel.findOne();
    const examIdToSave = firstExam ? firstExam._id : new mongoose.Types.ObjectId("000000000000000000000000");

    // 1. Check if a record already exists for this date globally, if so, delete the old questions first
    const existing = await CurrentAffairsModel.findOne({ date });
    if (existing) {
      if (existing.questionIds && existing.questionIds.length > 0) {
        await QuestionModel.deleteMany({ _id: { $in: existing.questionIds } });
      }
      await CurrentAffairsModel.deleteOne({ _id: existing._id });
      console.log(`[CurrentAffairsController] Deleted existing CurrentAffairs record for ${date}`);
    }

    // 2. Save questions to master collection
    const savedQuestionIds = [];
    for (const q of questions) {
      const newQuestion = new QuestionModel({
        ExamId: examIdToSave,
        en: {
          Question: q.en.Question,
          options: q.en.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
          answer: q.en.answer,
          solution: q.en.solution
        },
        hi: {
          Question: q.hi.Question,
          options: q.hi.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
          answer: q.hi.answer,
          solution: q.hi.solution
        },
        Subject: "General Awareness",
        Topic: "Current Affairs",
        Difficulty: q.Difficulty || 'Medium'
      });

      await newQuestion.validate();
      await newQuestion.save();
      savedQuestionIds.push(newQuestion._id);
    }

    // 3. Create metadata document
    const caRecord = new CurrentAffairsModel({
      date: new Date(date),
      examId: examIdToSave,
      totalQuestions: savedQuestionIds.length,
      questionIds: savedQuestionIds
    });

    await caRecord.save();
    console.log(`[CurrentAffairsController] Saved ${savedQuestionIds.length} questions. Metadata ID: ${caRecord._id}`);

    return res.status(200).json({
      success: true,
      message: "Questions saved successfully and monthly record created.",
      record: caRecord
    });
  } catch (error) {
    console.error("[CurrentAffairsController] Saving failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// List all uploaded months with metadata
export const listUploadedMonths = async (req, res) => {
  try {
    const list = await CurrentAffairsModel.find()
      .populate('examId', 'Name')
      .sort({ date: -1 });

    return res.status(200).json({ success: true, list });
  } catch (error) {
    console.error("[CurrentAffairsController] List failed:", error);
    return res.status(500).json({ success: false, message: "Failed to list monthly records" });
  }
};

// View questions associated with a monthly record
export const viewGeneratedQuestions = async (req, res) => {
  const { id } = req.params;

  try {
    const record = await CurrentAffairsModel.findById(id).populate('examId', 'Name');
    if (!record) {
      return res.status(404).json({ success: false, message: "Monthly record not found" });
    }

    const questions = await QuestionModel.find({ _id: { $in: record.questionIds } });

    return res.status(200).json({
      success: true,
      record,
      questions
    });
  } catch (error) {
    console.error("[CurrentAffairsController] View failed:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve questions" });
  }
};

// Delete a monthly record and its referenced questions
export const deleteCurrentAffairsRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const record = await CurrentAffairsModel.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Monthly record not found" });
    }

    // 1. Delete referenced questions
    if (record.questionIds && record.questionIds.length > 0) {
      await QuestionModel.deleteMany({ _id: { $in: record.questionIds } });
      console.log(`[CurrentAffairsController] Deleted ${record.questionIds.length} referenced questions.`);
    }

    // 2. Delete metadata document
    await CurrentAffairsModel.findByIdAndDelete(id);
    console.log(`[CurrentAffairsController] Deleted Monthly record: ${id}`);

    return res.status(200).json({
      success: true,
      message: "Current Affairs record and associated questions deleted successfully."
    });
  } catch (error) {
    console.error("[CurrentAffairsController] Deletion failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update metadata (like date) of a monthly record
export const updateCurrentAffairsMetadata = async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ success: false, message: "Date is required" });
  }

  try {
    const updated = await CurrentAffairsModel.findByIdAndUpdate(
      id,
      { date: new Date(date) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Monthly record not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Metadata updated successfully",
      record: updated
    });
  } catch (error) {
    console.error("[CurrentAffairsController] Update failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Dashboard Statistics
export const getCurrentAffairsStats = async (req, res) => {
  try {
    const totalPDFs = await CurrentAffairsModel.countDocuments();
    const totalQuestions = await QuestionModel.countDocuments({ Topic: 'Current Affairs' });
    
    const latestRecord = await CurrentAffairsModel.findOne()
      .populate('examId', 'Name')
      .sort({ date: -1 });

    const recentPDFs = await CurrentAffairsModel.find()
      .populate('examId', 'Name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Group questions count by month/year
    const monthlyStats = await CurrentAffairsModel.find()
      .populate('examId', 'Name')
      .sort({ date: -1 })
      .select('date totalQuestions examId');

    return res.status(200).json({
      success: true,
      stats: {
        totalPDFs,
        totalQuestions,
        latestMonth: latestRecord ? latestRecord.date : null,
        latestExam: latestRecord && latestRecord.examId ? latestRecord.examId.Name : null
      },
      recentPDFs,
      monthlyStats
    });
  } catch (error) {
    console.error("[CurrentAffairsController] Stats failed:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard statistics" });
  }
};
