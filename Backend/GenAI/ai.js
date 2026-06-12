import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyDb1r0D-46Z-VpIPORetp9FCEztYEf0_A0';
const genAI = new GoogleGenerativeAI(API_KEY);

export const AI = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });