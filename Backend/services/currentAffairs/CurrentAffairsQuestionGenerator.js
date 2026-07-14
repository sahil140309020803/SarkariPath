import { generateContent } from './GeminiCurrentAffairsService.js';
import { getPromptForCurrentAffairsChunk } from './PromptBuilder.js';
import { CURRENT_AFFAIRS_CONFIG } from './config.js';

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

export const parseCurrentAffairsQuestions = (aiResponseString) => {
  const jsonMatch = aiResponseString.match(/\[[\s\S]*\]/) || aiResponseString.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON array or object found in AI response.");

  let cleanedJsonString = jsonMatch[0]
    .replace(/\\/g, "\\\\")
    .replace(/\\\\"/g, "\\\"")
    .replace(/\\\\n/g, "\\n")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  const parsedData = JSON.parse(cleanedJsonString);
  let questionsList = [];
  if (Array.isArray(parsedData)) {
    questionsList = parsedData;
  } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
    questionsList = parsedData.questions;
  } else {
    throw new Error("AI response did not contain a list of questions.");
  }

  return questionsList;
};

// Count questions depending on chunk character length
export const determineQuestionCount = (chunkText) => {
  const len = chunkText.length;
  if (len < 2000) {
    return CURRENT_AFFAIRS_CONFIG.QUESTIONS_PER_SMALL_CHUNK;
  } else if (len < 4000) {
    return CURRENT_AFFAIRS_CONFIG.QUESTIONS_PER_MEDIUM_CHUNK;
  } else {
    return CURRENT_AFFAIRS_CONFIG.QUESTIONS_PER_LARGE_CHUNK;
  }
};

export const generateQuestionsForChunk = async (chunkText, emitStatus = null) => {
  const prompt = getPromptForCurrentAffairsChunk(chunkText);

  let retryCount = 0;
  while (retryCount < CURRENT_AFFAIRS_CONFIG.MAX_RETRIES) {
    try {
      if (emitStatus) {
        emitStatus(`Sending chunk to AI for MCQ generation...`);
      }
      
      const result = await withTimeout(generateContent(prompt), 45000);
      const aiResponseString = result.response.candidates[0].content.parts[0].text;
      
      const questions = parseCurrentAffairsQuestions(aiResponseString);
      if (questions && questions.length > 0) {
        return questions;
      }
      
      retryCount++;
    } catch (err) {
      console.error(`[CurrentAffairsQuestionGenerator] Attempt ${retryCount + 1} failed:`, err);
      retryCount++;
      if (retryCount >= CURRENT_AFFAIRS_CONFIG.MAX_RETRIES) {
        throw new Error(`AI chunk processing failed after ${CURRENT_AFFAIRS_CONFIG.MAX_RETRIES} attempts. Last error: ${err.message}`);
      }
      // wait a bit before retry
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return [];
};
