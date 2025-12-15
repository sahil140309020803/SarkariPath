import { MockTestModel } from "../models/ExamModel.js";

const fetchActiveTest = async (req, res) => {
    const testID = req.params?.testID;
    try {
        const testData = await MockTestModel.findById(testID).populate('Questions').lean();
        if(!testData) {
            return res.json({success: false, message: "Test not found"});
        }
        res.json({ success: true, Test: testData });
    } catch(err) {
        res.json({success: false, message: err.message});
    }
}

export default fetchActiveTest;