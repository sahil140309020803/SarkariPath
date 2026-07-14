import 'dotenv/config';

export const CURRENT_AFFAIRS_CONFIG = {
  MAX_CHUNK_SIZE: parseInt(process.env.CA_MAX_CHUNK_SIZE) || 4000,
  QUESTIONS_PER_SMALL_CHUNK: parseInt(process.env.CA_QUESTIONS_PER_SMALL_CHUNK) || 2,
  QUESTIONS_PER_MEDIUM_CHUNK: parseInt(process.env.CA_QUESTIONS_PER_MEDIUM_CHUNK) || 3,
  QUESTIONS_PER_LARGE_CHUNK: parseInt(process.env.CA_QUESTIONS_PER_LARGE_CHUNK) || 5,
  MAX_RETRIES: parseInt(process.env.CA_MAX_RETRIES) || 3,
  MODEL_NAME: process.env.CA_MODEL_NAME || "gemini-3.1-flash-lite",
  TEMPERATURE: parseFloat(process.env.CA_TEMPERATURE) || 0.2,
  TOP_P: parseFloat(process.env.CA_TOP_P) || 0.9,
  SLEEP_TIME: parseInt(process.env.CA_SLEEP_TIME) || 4000
};
