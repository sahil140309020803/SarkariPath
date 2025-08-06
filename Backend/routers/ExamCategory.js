import express from 'express'
import { getExamsListFromCategory } from '../controllers/GetExamsList.js';

const examCat = express.Router()

examCat.post('/get-exams-list', getExamsListFromCategory);

export default examCat;