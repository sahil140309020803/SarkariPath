import { MockTestModel, QuestionModel, examModel, TestSubmissionModel } from '../models/ExamModel.js';





export const fetchGenerations = async (req, res) => {
  try {
    const generations = await MockTestModel.find({})
      .populate('Questions')
      .populate('ExamId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, generations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch past generations" });
  }
};

export const deleteGeneration = async (req, res) => {
  const { testId } = req.params;
  try {
    const test = await MockTestModel.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test generation not found" });
    }

    // 1. Delete associated questions from QuestionModel
    if (test.Questions && test.Questions.length > 0) {
      await QuestionModel.deleteMany({ _id: { $in: test.Questions } });
    }

    // 2. Delete associated submissions
    await TestSubmissionModel.deleteMany({ testId: testId });

    // 3. Remove from Exam Model's arrays if published
    if (test.Status === 'Published') {
      await examModel.findByIdAndUpdate(test.ExamId, {
        $pull: { MockTests: testId }
      });
    }

    // 4. Delete the test itself
    await MockTestModel.findByIdAndDelete(testId);

    res.status(200).json({ success: true, message: "Test generation deleted successfully" });
  } catch (err) {
    console.error("Delete generation error:", err);
    res.status(500).json({ success: false, message: "Failed to delete test generation" });
  }
};

export const publishGeneration = async (req, res) => {
  const { testId } = req.params;
  try {
    const test = await MockTestModel.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test generation not found" });
    }

    test.Status = 'Published';
    await test.save();

    const exam = await examModel.findById(test.ExamId);
    if (exam) {
      if (!exam.MockTests.includes(test._id)) {
        exam.MockTests.push(test._id);
        await exam.save();
      }
    }
    res.status(200).json({ success: true, message: "Test generation published successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to publish test generation" });
  }
};

export const fetchMockTestsByExam = async (req, res) => {
  const { examId } = req.params;
  try {
    const mocks = await MockTestModel.find({ ExamId: examId })
      .populate('Questions')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, mocks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch mock tests for this exam" });
  }
};

export const fetchSubjectsForExam = async (req, res) => {
  const { examId } = req.body;
  try {
    const exam = await examModel.findById(examId);
    if (!exam) {
      res.status(404).json({ success: false, message: "Exam not found" });
      return;
    }
    res.status(200).json({ success: true, Subjects: exam.Subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch subjects for exam" });
  }
}
