import express from 'express';
import multer from 'multer';
import { isAuth } from '../middlewares/IsAuth.js';
import {
  uploadCurrentAffairsPDF,
  saveCurrentAffairsQuestions,
  listUploadedMonths,
  viewGeneratedQuestions,
  deleteCurrentAffairsRecord,
  updateCurrentAffairsMetadata,
  getCurrentAffairsStats
} from '../controllers/CurrentAffairsController.js';

export const currentAffairsRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Stats for dashboard
currentAffairsRouter.get('/stats', isAuth, getCurrentAffairsStats);

// Upload Monthly Current Affairs PDF
currentAffairsRouter.post('/upload', isAuth, upload.single('pdf'), uploadCurrentAffairsPDF);

// Save generated questions to DB
currentAffairsRouter.post('/save-questions', isAuth, saveCurrentAffairsQuestions);

// List uploaded months
currentAffairsRouter.get('/', isAuth, listUploadedMonths);

// View details & questions of a specific month
currentAffairsRouter.get('/:id', isAuth, viewGeneratedQuestions);

// Update monthly metadata
currentAffairsRouter.put('/:id', isAuth, updateCurrentAffairsMetadata);

// Delete monthly record & referenced questions
currentAffairsRouter.delete('/:id', isAuth, deleteCurrentAffairsRecord);
