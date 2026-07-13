import { validateMockTest, applyMockCorrection, regenerateSingleQuestion } from '../services/adminGeneration/AdminValidatorService.js';

export const validateMock = async (req, res) => {
  const { testId, questionIds } = req.body;
  if (!testId) {
    return res.status(400).json({ success: false, message: "testId is required" });
  }

  try {
    const issues = await validateMockTest(testId, questionIds);
    return res.status(200).json({ success: true, issues });
  } catch (error) {
    console.error("[AdminMockValidationController] Validation failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const applyCorrection = async (req, res) => {
  const { testId, questionId, correctedPayload } = req.body;
  if (!testId || !questionId || !correctedPayload) {
    return res.status(400).json({ success: false, message: "testId, questionId, and correctedPayload are required" });
  }

  try {
    const updatedTest = await applyMockCorrection(testId, questionId, correctedPayload);
    return res.status(200).json({ success: true, message: "Correction applied successfully", test: updatedTest });
  } catch (error) {
    console.error("[AdminMockValidationController] Apply correction failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const regenerateQuestion = async (req, res) => {
  const { testId, questionId } = req.body;
  if (!testId || !questionId) {
    return res.status(400).json({ success: false, message: "testId and questionId are required" });
  }

  try {
    const updatedTest = await regenerateSingleQuestion(testId, questionId);
    return res.status(200).json({ success: true, message: "Question regenerated successfully", test: updatedTest });
  } catch (error) {
    console.error("[AdminMockValidationController] Question regeneration failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
