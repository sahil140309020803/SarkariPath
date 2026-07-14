import { GoogleGenerativeAI } from "@google/generative-ai";
import { CURRENT_AFFAIRS_CONFIG } from "./config.js";
import 'dotenv/config';

const API_KEY = process.env.ADMIN_GEMINI_API_KEY || process.env.USER_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const caAI = genAI.getGenerativeModel({
  model: CURRENT_AFFAIRS_CONFIG.MODEL_NAME,
  generationConfig: {
    temperature: CURRENT_AFFAIRS_CONFIG.TEMPERATURE,
    topP: CURRENT_AFFAIRS_CONFIG.TOP_P
  }
});

export const generateContent = async (prompt) => {
  return await caAI.generateContent(prompt);
};
