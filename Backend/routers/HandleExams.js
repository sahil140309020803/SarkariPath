import express from 'express'
import { addExam, deleteExam, getExams, editExam, getSubjectTopics, generateTopicsViaAI, generateSubjectsViaAI, generateQuestionCountsViaAI } from '../controllers/ExamController.js';

const examRouter = express.Router();

examRouter.post('/add-exam', addExam);
examRouter.get('/get-exam/:categoryId', getExams);
examRouter.get('/delete-exam/:examId', deleteExam);
examRouter.put('/edit-exam/:examId', editExam);
examRouter.get('/:examId/subjects/:subject/topics', getSubjectTopics);
examRouter.post('/ai/generate-topics', generateTopicsViaAI);
examRouter.post('/ai/generate-subjects', generateSubjectsViaAI);
examRouter.post('/ai/generate-question-counts', generateQuestionCountsViaAI);

export default examRouter;