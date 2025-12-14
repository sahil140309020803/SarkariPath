import express from 'express'
import { addExam, deleteExam, getExams } from '../controllers/ExamController.js';

const examRouter = express.Router();

examRouter.post('/add-exam', addExam);
examRouter.get('/get-exam/:categoryId', getExams);
examRouter.get('/delete-exam/:examId', deleteExam);

export default examRouter;