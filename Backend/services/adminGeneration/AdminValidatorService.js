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
2. "mathematicalVerification": 
   - SOLVE FIRST INDEPENDENTLY: You must solve the question using ONLY the question statement and the options list. Temporarily ignore the pre-existing "answer" and "solution" fields in the input data.
   - Show your step-by-step calculation, reasoning, or derivation to arrive at the correct answer.
   - COMPARE: Compare your calculated correct answer with the pre-existing "answer" and the option that is marked "isCorrect: true" in the input data.
   - Check if there is any mismatch or mathematical/factual discrepancy.
3. "optionCheck":
   - Verify if exactly ONE option has "isCorrect: true" in the input data.
   - Verify if the pre-existing "answer" text matches the option text marked "isCorrect: true".
   - If your independent calculation from "mathematicalVerification" produced a different correct option or value than the one marked "isCorrect: true" or written in "answer", document that discrepancy here.
4. "isValid": After your verification steps, if there is ANY missing question statement, structural issue, mismatch between your independent solution and the pre-existing answer/option, incorrect correct-option flag, or factual/mathematical error, set this to false. Otherwise, set it to true.

LANGUAGE RULES FOR PROPOSED CORRECTIONS (CRITICAL):
- For Hindi-related subjects/topics (e.g., General Hindi, Hindi Language, etc.): BOTH the "en" and "hi" objects in the proposedCorrection MUST be written in Hindi language. Copy the Hindi question text, options, answers, and solutions as-is into BOTH fields. Do NOT translate Hindi questions into English.
- For English-related subjects/topics (e.g., General English, English Language, etc.): BOTH the "en" and "hi" objects in the proposedCorrection MUST be written in English language. Copy the English question text, options, answers, and solutions as-is into BOTH fields. Do NOT translate English questions into Hindi.
- For all other subjects: The "en" object must contain English language and the "hi" object must contain Hindi language.

EXPLANATION STYLE RULES (for proposedCorrection "solution"):
- The explanation ("solution" field) in proposed corrections must be written like a standard, professional textbook/exam answer key solution.
- Do NOT use conversational AI filler, greetings, or meta-references (e.g., do NOT start with "The correct option is...", "Here is the explanation...", "Sure, let's understand...", etc.).
- Start directly with the factual concept, formulas, historical facts, grammatical rules, or step-by-step mathematical calculations that justify the correct choice.
- Keep the language authoritative, direct, and academic.

Return ONLY a raw JSON array of exactly ${questionsBatch.length} objects. Do not include markdown blocks or conversational text.
JSON Output Format:
[
  {
    "questionId": "string matching the MongoDB _id of the question",
    "questionNumber": number,
    "structuralCheck": "Verify that en.Question and hi.Question are not empty or blank",
    "mathematicalVerification": "Step-by-step math calculation or factual verification done independently, followed by comparing with the existing answer and identifying any discrepancies.",
    "optionCheck": "List correct options (e.g. Option B isCorrect: true, matches answer '30'. If discrepancy exists, describe it here.)",
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
    "issue": "Language discrepancy, structural check fail, or factual error.",
    "proposedCorrection": {
      "en": {
        "Question": "Corrected question text (in Hindi for Hindi subjects, in English for English/other subjects)",
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
        "Question": "Corrected question text (in English for English subjects, in Hindi for Hindi/other subjects)",
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

export const validateMockTest = async (testId, questionIds = null) => {
  const test = await MockTestModel.findById(testId).populate('Questions').lean();
  if (!test) {
    throw new Error("Mock test not found");
  }

  let questions = test.Questions || [];
  if (questionIds && Array.isArray(questionIds)) {
    const qIds = questionIds.map(id => id.toString());
    questions = questions.filter(q => q && q._id && qIds.includes(q._id.toString()));
  }

  if (questions.length === 0) {
    return [];
  }

  const allIssues = [];
  const BATCH_SIZE = 5;
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
