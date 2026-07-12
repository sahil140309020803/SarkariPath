import { adminAI } from './AdminGeminiService.js';
import { MockTestModel, QuestionModel, examModel } from '../../models/ExamModel.js';
import { getAdminMultipleQuestionsPrompt } from './AdminPromptBuilder.js';
import { parseAdminQuestions } from './AdminQuestionParser.js';

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

export const getMockValidationPrompt = (questionsBatch) => {
  return `You are an expert exam auditor and subject matter specialist.
Your task is to audit the following list of MCQs (Multiple Choice Questions) generated for a competitive exam and identify if they contain any structural, factual, mathematical, answer key, or translation errors.

Here are the questions to audit:
${JSON.stringify(questionsBatch, null, 2)}

For each of the ${questionsBatch.length} questions, you must write a detailed, step-by-step audit.
You must return a raw JSON array containing EXACTLY ${questionsBatch.length} objects (one for each input question in the exact same order).

CRITICAL AUDITING STEPS FOR EACH QUESTION:
1. "structuralCheck": Verify if the question statement ("en.Question" and "hi.Question") is present and is NOT an empty string, null, or whitespace. Verify if all options have non-empty text. If the question statement is missing or blank, the question is INVALID.
2. "mathematicalVerification": Solve the question yourself step-by-step. Show the actual mathematical calculation. Do not just copy the solution. Check if the computed answer is correct.
3. "optionCheck":
   - List the option text where "isCorrect: true" is set.
   - Verify if exactly ONE option has "isCorrect: true".
   - Verify if the correct option's text matches the "answer" field.
   - Verify if the step-by-step solution calculates this exact option.
4. "isValid": After your verification steps, if there is ANY missing question statement, factual error, mathematical error, incorrect option key, missing correct option, multiple correct options, or wrong explanation, set this to false. Otherwise, set it to true.

Return ONLY a raw JSON array of exactly ${questionsBatch.length} objects. Do not include markdown blocks or conversational text.
JSON Output Format:
[
  {
    "questionId": "string matching the MongoDB _id of the question",
    "questionNumber": number,
    "structuralCheck": "Verify that en.Question and hi.Question are not empty or blank",
    "mathematicalVerification": "Step-by-step math calculation or factual verification",
    "optionCheck": "List correct options (e.g. Option B isCorrect: true, matches answer '30')",
    "isValid": true,
    "issue": null,
    "proposedCorrection": null
  },
  {
    "questionId": "string matching the MongoDB _id of the question",
    "questionNumber": number,
    "structuralCheck": "FAIL: en.Question is empty or missing question statement text.",
    "mathematicalVerification": "N/A - Cannot calculate as question statement is missing.",
    "optionCheck": "Options are present, but question statement is empty.",
    "isValid": false,
    "issue": "Missing question statement. The Question field is empty or blank.",
    "proposedCorrection": {
      "en": {
        "Question": "Corrected English question text (regenerated based on Topic/Subject)",
        "options": [
          { "text": "Choice A text", "isCorrect": false },
          { "text": "Choice B text", "isCorrect": false },
          { "text": "Choice C text", "isCorrect": true },
          { "text": "Choice D text", "isCorrect": false }
        ],
        "answer": "Correct choice text",
        "solution": "Correct step-by-step explanation"
      },
      "hi": {
        "Question": "हिन्दी में सही प्रश्न (regenerated)",
        "options": [
          { "text": "विकल्प A", "isCorrect": false },
          { "text": "विकल्प B", "isCorrect": false },
          { "text": "विकल्प C", "isCorrect": true },
          { "text": "विकल्प D", "isCorrect": false }
        ],
        "answer": "सही विकल्प का टेक्स्ट",
        "solution": "सही व्याख्या"
      },
      "Topic": "Topic Name"
    }
  }
]`;
};

export const validateMockTest = async (testId) => {
  const test = await MockTestModel.findById(testId).populate('Questions').lean();
  if (!test) {
    throw new Error("Mock test not found");
  }

  const questions = test.Questions || [];
  if (questions.length === 0) {
    return [];
  }

  const allIssues = [];
  const BATCH_SIZE = 15;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Process in batches to avoid context size / token limits issues
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    if (i > 0) {
      console.log(`[AdminValidator] Respecting rate limiter. Sleeping 5 seconds before batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
      await sleep(5000);
    }

    const batch = questions.slice(i, i + BATCH_SIZE).map((q, index) => ({
      questionId: q._id.toString(),
      questionNumber: i + index + 1,
      en: q.en,
      hi: q.hi,
      Topic: q.Topic,
      Subject: q.Subject
    }));

    console.log(`[AdminValidator] Auditing batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batch.length} questions...`);

    const prompt = getMockValidationPrompt(batch);
    let attempts = 0;
    const MAX_ATTEMPTS = 2;
    let success = false;

    while (attempts < MAX_ATTEMPTS && !success) {
      try {
        const result = await withTimeout(
          adminAI.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.0,
              topP: 0.1
            }
          }),
          45000
        );
        const aiResponseString = result.response.candidates[0].content.parts[0].text;
        console.log(`[AdminValidator] AI Audit Response:\n${aiResponseString}`);

        // Clean markdown blocks if any
        const cleanedJson = aiResponseString.replace(/```json\n?|```/g, "").trim();
        const parsedIssues = JSON.parse(cleanedJson);

        if (Array.isArray(parsedIssues)) {
          const invalidQuestions = parsedIssues.filter(item => item.isValid === false);
          allIssues.push(...invalidQuestions);
          success = true;
        } else {
          attempts++;
        }
      } catch (err) {
        console.error(`[AdminValidator] Batch audit attempt ${attempts + 1} failed: ${err.message}`);
        attempts++;
      }
    }
  }

  return allIssues;
};

export const applyMockCorrection = async (testId, questionId, correctedPayload) => {
  const question = await QuestionModel.findById(questionId);
  if (!question) {
    throw new Error("Question not found");
  }

  // Update properties
  if (correctedPayload.en) question.en = correctedPayload.en;
  if (correctedPayload.hi) question.hi = correctedPayload.hi;
  if (correctedPayload.Topic) {
    question.Topic = correctedPayload.Topic;
  }

  await question.validate();
  await question.save();

  // Return the updated mock test
  const updatedTest = await MockTestModel.findById(testId).populate('Questions').lean();
  return updatedTest;
};

export const regenerateSingleQuestion = async (testId, questionId) => {
  const test = await MockTestModel.findById(testId).populate('Questions').lean();
  if (!test) {
    throw new Error("Mock test not found");
  }

  const question = await QuestionModel.findById(questionId);
  if (!question) {
    throw new Error("Question not found");
  }

  const subjectName = question.Subject;
  const topicName = question.Topic || "General";
  const difficulty = test.Difficulty || 'Medium';

  const previousQuestions = await QuestionModel.find({
    ExamId: test.ExamId,
    $or: [{ Subject: subjectName }, { Topic: topicName }]
  })
    .sort({ createdAt: -1 })
    .limit(60)
    .select('Topic en.Question hi.Question');

  const history = previousQuestions.map(q => ({
    topic: q.Topic,
    summary: (q.en?.Question || q.hi?.Question || "").substring(0, 100)
  }));

  let examName = "Competitive Exam";
  const examDoc = await examModel.findById(test.ExamId);
  if (examDoc) {
    examName = examDoc.Name;
  }

  const prompt = getAdminMultipleQuestionsPrompt(
    examName,
    subjectName,
    [topicName],
    difficulty,
    history,
    1
  );

  const result = await withTimeout(adminAI.generateContent(prompt), 35000);
  const aiResponseString = result.response.candidates[0].content.parts[0].text;
  const parsedQuestions = parseAdminQuestions(aiResponseString);

  if (!parsedQuestions || parsedQuestions.length === 0) {
    throw new Error("AI failed to generate a replacement question.");
  }

  const questionData = parsedQuestions[0];
  
  const newQuestion = new QuestionModel({
    ...questionData,
    ExamId: test.ExamId,
    Subject: subjectName,
    Topic: topicName,
    Difficulty: difficulty
  });

  await newQuestion.validate();
  await newQuestion.save();

  const updatedTestDoc = await MockTestModel.findById(testId);
  const index = updatedTestDoc.Questions.findIndex(id => id.toString() === questionId);
  if (index !== -1) {
    updatedTestDoc.Questions[index] = newQuestion._id;
  } else {
    updatedTestDoc.Questions.push(newQuestion._id);
  }
  await updatedTestDoc.save();

  await QuestionModel.findByIdAndDelete(questionId);

  const finalTest = await MockTestModel.findById(testId).populate('Questions').lean();
  return finalTest;
};
