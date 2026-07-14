import { extractTextFromPDF } from './PDFTextExtractor.js';
import { splitTextIntoChunks } from './TextChunker.js';
import { generateQuestionsForChunk } from './CurrentAffairsQuestionGenerator.js';
import { removeDuplicateQuestions } from './DuplicateQuestionRemover.js';
import { filterValidQuestions } from './QuestionValidator.js';
import { CURRENT_AFFAIRS_CONFIG } from './config.js';
import { QuestionModel } from '../../models/ExamModel.js';
import mongoose from 'mongoose';

export const processCurrentAffairsPDF = async (pdfBuffer, io = null, socketId = null) => {
  const socket = io && socketId ? io.sockets.sockets.get(socketId) : null;
  const emitProgress = (progressData) => {
    if (socket) {
      socket.emit('ca_generation_progress', progressData);
    }
  };

  console.log("[CurrentAffairsService] PDF Uploaded");
  emitProgress({ status: 'extracting', message: 'Extracting text from PDF...' });

  const fullText = await extractTextFromPDF(pdfBuffer);
  console.log("[CurrentAffairsService] Text Extracted");
  emitProgress({ status: 'chunking', message: 'Splitting text into chunks...' });

  const chunks = splitTextIntoChunks(fullText, CURRENT_AFFAIRS_CONFIG.MAX_CHUNK_SIZE);
  console.log(`[CurrentAffairsService] Chunks Created. Total chunks: ${chunks.length}`);
  
  const allQuestions = [];
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < chunks.length; i++) {
    const chunkIndex = i + 1;
    console.log(`[CurrentAffairsService] Chunk Sent: Processing chunk ${chunkIndex}/${chunks.length}`);
    emitProgress({
      status: 'generating',
      currentChunk: chunkIndex,
      totalChunks: chunks.length,
      message: `Generating questions for chunk ${chunkIndex} of ${chunks.length}...`
    });

    const chunkQuestions = await generateQuestionsForChunk(chunks[i], (msg) => {
      emitProgress({
        status: 'generating',
        currentChunk: chunkIndex,
        totalChunks: chunks.length,
        message: `Chunk ${chunkIndex}/${chunks.length}: ${msg}`
      });
    });

    console.log(`[CurrentAffairsService] Questions Generated: ${chunkQuestions.length} questions from chunk ${chunkIndex}`);
    allQuestions.push(...chunkQuestions);

    if (i < chunks.length - 1) {
      const waitTime = CURRENT_AFFAIRS_CONFIG.SLEEP_TIME;
      console.log(`[CurrentAffairsService] Pacing API requests. Sleeping ${waitTime / 1000} seconds...`);
      await sleep(waitTime);
    }
  }

  emitProgress({ status: 'validating', message: 'Validating questions structure...' });
  const validatedQuestions = filterValidQuestions(allQuestions);
  console.log(`[CurrentAffairsService] Questions Validated: ${validatedQuestions.length} valid out of ${allQuestions.length}`);

  emitProgress({ status: 'deduplicating', message: 'Removing duplicate questions...' });
  const uniqueQuestions = removeDuplicateQuestions(validatedQuestions);
  console.log(`[CurrentAffairsService] Duplicates Removed. Remaining questions: ${uniqueQuestions.length}`);

  console.log("[CurrentAffairsService] Preview Ready");
  emitProgress({ status: 'ready', message: 'Questions generation completed!', questionsCount: uniqueQuestions.length });

  console.log("[CurrentAffairsService] Completed");
  return uniqueQuestions;
};

export const fetchAndCloneCurrentAffairsQuestions = async (examId, difficulty, count, excludeIds = []) => {
  try {
    const matchQuery = {
      Topic: 'Current Affairs',
      Difficulty: difficulty || 'Medium',
      _id: { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) }
    };

    // Aggregate to get random questions
    let questions = await QuestionModel.aggregate([
      { $match: matchQuery },
      { $sample: { size: count } }
    ]);

    // Fallback: If not enough questions found for this specific difficulty, fetch from ANY difficulty
    if (questions.length < count) {
      const remainingCount = count - questions.length;
      const alreadyFoundIds = [...excludeIds, ...questions.map(q => q._id)];
      const fallbackQuery = {
        Topic: 'Current Affairs',
        _id: { $nin: alreadyFoundIds.map(id => new mongoose.Types.ObjectId(id)) }
      };

      const fallbackQuestions = await QuestionModel.aggregate([
        { $match: fallbackQuery },
        { $sample: { size: remainingCount } }
      ]);
      questions = [...questions, ...fallbackQuestions];
    }

    // Clone the retrieved questions to ensure cascade safety
    const clonedQuestions = questions.map(q => {
      return {
        en: {
          Question: q.en?.Question || '',
          options: (q.en?.options || []).map(o => ({ text: o.text, isCorrect: o.isCorrect })),
          answer: q.en?.answer || '',
          solution: q.en?.solution || ''
        },
        hi: {
          Question: q.hi?.Question || '',
          options: (q.hi?.options || []).map(o => ({ text: o.text, isCorrect: o.isCorrect })),
          answer: q.hi?.answer || '',
          solution: q.hi?.solution || ''
        },
        Subject: q.Subject || 'General Awareness',
        Topic: q.Topic || 'Current Affairs',
        Difficulty: q.Difficulty || difficulty || 'Medium'
      };
    });

    return clonedQuestions;
  } catch (error) {
    console.error("[CurrentAffairsService] Error fetching/cloning Current Affairs questions:", error);
    return [];
  }
};

