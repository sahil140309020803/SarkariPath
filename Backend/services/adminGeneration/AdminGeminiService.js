import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const API_KEY = process.env.ADMIN_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const adminAI = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

export const generateContent = async (prompt) => {
  return await adminAI.generateContent(prompt);
};
