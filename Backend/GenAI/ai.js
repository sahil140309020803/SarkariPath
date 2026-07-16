import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.USER_GEMINI_API_KEY);

export const AI = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });