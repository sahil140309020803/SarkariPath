import { MockTestModel, QuizModel } from "../models/ExamModel.js";

const fetchActiveTest = async (req, res) => {
    const testID = req.params?.testID;
    try {
        let testData = await MockTestModel.findById(testID).populate('ExamId').populate('Questions').lean();
        if(!testData) {
            testData = await QuizModel.findById(testID).populate('ExamId').populate('Questions').lean();
        }
        if(!testData) {
            return res.json({success: false, message: "Test not found"});
        }
        // console.log('Fetched active test data:', testData);
        res.json({ success: true, Test: testData });
    } catch(err) {
        res.json({success: false, message: err.message});
    }
}

export default fetchActiveTest;