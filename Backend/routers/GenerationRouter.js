import express from 'express';
import { deleteGeneration, fetchGenerations, fetchSubjectsForExam, publishGeneration } from '../controllers/generationController.js';

export const generationRouter = express.Router();

generationRouter.get('/fetch', fetchGenerations);

generationRouter.get('/delete/:testId', deleteGeneration);

generationRouter.get('/publish/:testId', publishGeneration);

generationRouter.post('/subjects', fetchSubjectsForExam);
