import { AI } from '../GenAI/ai.js';
import { MockTestModel, QuestionModel, examModel, TestSubmissionModel } from '../models/ExamModel.js';

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

// --- CONFIGURABLE QUIZ EXPIRY ---
// Current setting: 10 minutes (in milliseconds)
const QUIZ_EXPIRY_DURATION = 10 * 60 * 1000;

const activeGenerations = new Map();

export const setupSocketHandlers = (socket, io) => {

  socket.on('stop_generation', (testId) => {
    activeGenerations.set(testId, false);
    socket.emit('generation_status', { message: "Stopping... Please wait." });
  });

  socket.on('start_generation', async (data) => {
    const { title, examId, rules, difficulty, negativeMarks, duration, totalMarks, type, subjectName, topicName, examName, marksPerQuestion } = data;

    let activeTest;
    const totalRequired = rules.reduce((acc, rule) => acc + (parseInt(rule.count) || 0), 0);
    const testType = type === 'quiz' ? 'quiz' : 'mock_test';
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    try {
      let examNameOrFallback = examName;
      let examDoc = null;
      try {
        examDoc = await examModel.findById(examId);
        if (examDoc) {
          examNameOrFallback = examDoc.Name;
        }
      } catch (err) {
        console.error("Error fetching exam Name in start_generation:", err);
      }
      if (!examNameOrFallback) {
        examNameOrFallback = "Competitive Exam";
      }
      if (testType === 'quiz') {
        // ... (Your existing quiz creation code) ...
        activeTest = new MockTestModel({
          Title: title,
          ExamId: examId,
          Status: 'Published',
          Difficulty: difficulty || 'Medium',
          NegativeMarks: negativeMarks || 0,
          Structure: rules.map(r => ({ Subject: r.name, QuestionCount: r.count })),
          Questions: [],
          TotalMarks: totalMarks || (totalRequired * (parseFloat(marksPerQuestion) || 1)),
          MarksPerQuestion: parseFloat(marksPerQuestion) || 1,
          DurationinMinutes: duration || 20,
          type: 'quiz',
          expireAt: new Date(Date.now() + QUIZ_EXPIRY_DURATION)
        });
        await activeTest.save();

      } else {
        // ... (Your existing mock test creation code) ...
        activeTest = await MockTestModel.findOne({
          Title: title,
          ExamId: examId,
          Status: 'Draft',
          type: 'mock_test'
        }).populate('Questions');

        if (!activeTest) {
          activeTest = new MockTestModel({
            Title: title,
            ExamId: examId,
            Status: 'Draft',
            Difficulty: difficulty || 'Medium',
            NegativeMarks: negativeMarks || 0,
            Structure: rules.map(r => ({ Subject: r.name, QuestionCount: r.count })),
            Questions: [],
            TotalMarks: totalMarks || (totalRequired * (parseFloat(marksPerQuestion) || 1)),
            MarksPerQuestion: parseFloat(marksPerQuestion) || 1,
            DurationinMinutes: duration,
            type: 'mock_test'
          });
          await activeTest.save();
        }
      }

      activeGenerations.set(activeTest._id.toString(), true);

      // 1. Initialize session history (Questions generated in THIS specific test)
      let sessionHistory = [];
      if (activeTest.Questions && activeTest.Questions.length > 0) {
        // ... (Your existing history loading logic) ...
        // Note: Renamed generatedHistory -> sessionHistory for clarity
        if (activeTest.Questions[0] instanceof QuestionModel) {
          sessionHistory = activeTest.Questions.map(q => ({
            topic: q.Topic,
            summary: (q.en?.Question || q.hi?.Question || "").substring(0, 50)
          }));
        } else {
          const loadedQuestions = await QuestionModel.find({ _id: { $in: activeTest.Questions } });
          sessionHistory = loadedQuestions.map(q => ({
            topic: q.Topic,
            summary: (q.en?.Question || q.hi?.Question || "").substring(0, 50)
          }));
        }
      }

      for (const rule of rules) {
        const currentTestState = await MockTestModel.findById(activeTest._id).populate('Questions');

        const existingSubjectQuestions = currentTestState.Questions.filter(q => q.Subject === rule.name || q.Topic === rule.name);
        const remainingCount = rule.count - existingSubjectQuestions.length;

        let subjectTopics = [];
        if (testType === 'quiz' && !topicName) {
          if (examDoc && examDoc.Topics && examDoc.Topics[rule.name]) {
            subjectTopics = examDoc.Topics[rule.name];
          }
        }

        // ---------------------------------------------------------
        // 2. FIX: Fetch Global History from previous tests
        // ---------------------------------------------------------
        // Search in both Subject and Topic fields to catch all previous occurrences
        const previousQuestions = await QuestionModel.find({
          ExamId: examId,
          $or: [
            { Subject: rule.name },
            { Topic: rule.name }
          ]
        })
          .sort({ createdAt: -1 })
          .limit(60)
          .select('Topic en.Question hi.Question');

        const globalHistory = previousQuestions.map(q => ({
          topic: q.Topic,
          summary: (q.en?.Question || q.hi?.Question || "").substring(0, 100) // Longer summary for better context
        }));

        // Combine global history with current session history
        const fullHistory = [...globalHistory, ...sessionHistory];
        // ---------------------------------------------------------

        for (let i = 0; i < remainingCount; i++) {
          if (activeGenerations.get(activeTest._id.toString()) === false) throw new Error("Cancelled.");

          let currentTopicName = topicName;
          if (testType === 'quiz' && !topicName && subjectTopics.length > 0) {
            const randomIndex = Math.floor(Math.random() * subjectTopics.length);
            currentTopicName = subjectTopics[randomIndex];
          }

          let questionGenerated = false;
          let retryCount = 0;
          const MAX_RETRIES = 5;
          let lastError = "";
          let lastResponse = "";

          while (!questionGenerated && retryCount < MAX_RETRIES) {
            try {
              socket.emit('generation_progress', {
                count: currentTestState.Questions.length + i,
                total: totalRequired,
                status: `Processing ${rule.name}...`
              });

              // 3. Pass fullHistory instead of sessionHistory
              // We pass the current question index (i) to help the AI vary its behavior
              const prompt = getSingleQuestionPrompt(
                examNameOrFallback,
                (testType === 'quiz' && subjectName) ? subjectName : rule.name,
                currentTopicName,
                difficulty,
                lastError,
                lastResponse,
                fullHistory,
                i
              );

              const result = await withTimeout(AI.generateContent(prompt), 30000);
              const aiResponseString = result.response.candidates[0].content.parts[0].text;

              const jsonMatch = aiResponseString.match(/\{[\s\S]*\}/);
              if (!jsonMatch) throw new Error("No JSON found.");

              let cleanedJsonString = jsonMatch[0]
                .replace(/\\/g, "\\\\")
                .replace(/\\\\"/g, "\\\"")
                .replace(/\\\\n/g, "\\n")
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

              const questionData = JSON.parse(cleanedJsonString);

              const newQuestion = new QuestionModel({
                ...questionData,
                ExamId: examId,
                Subject: (testType === 'quiz' && subjectName) ? subjectName : rule.name,
                Topic: currentTopicName || questionData.Topic,
                Difficulty: difficulty,
                ...(testType === 'quiz' && { expireAt: activeTest.expireAt })
              });

              await newQuestion.validate();
              await newQuestion.save();

              activeTest = await MockTestModel.findByIdAndUpdate(
                activeTest._id,
                { $push: { Questions: newQuestion._id } },
                { new: true }
              );

              // Update session history so we don't repeat within the same test
              sessionHistory.push({
                topic: questionData.Topic,
                summary: (questionData.en?.Question || "").substring(0, 100)
              });

              // Also update fullHistory for the immediate next iteration of this loop
              fullHistory.push({
                topic: questionData.Topic,
                summary: (questionData.en?.Question || "").substring(0, 100)
              });

              const printSubject = (testType === 'quiz' && subjectName) ? subjectName : rule.name;
              console.log(`Generated ${i + 1}/${totalRequired} for Subject: ${printSubject}, Topic: ${currentTopicName || 'None'}, Exam: ${examNameOrFallback}`)
              questionGenerated = true;
            } catch (error) {
              retryCount++;
              lastError = error.message;
              console.error(`Attempt ${retryCount} failed: ${error.message}`);
              if (retryCount >= MAX_RETRIES) throw new Error(`Generation failed: ${error.message}`);
            }
          }
          // Sleep for a short duration to avoid hitting rate limits and to give the AI some "breathing room"
          console.log("Sleeping for 5 seconds before next question generation...");
          await sleep(5000);
          console.log("Resuming generation...");
        }
      }
      socket.emit('generation_complete', { message: 'Generated Successfully!', test: activeTest });
    } catch (error) {
      console.error(error);
      socket.emit('generation_error', { message: error.message });
    }
  });
};

function getSingleQuestionPrompt(examName, subjectName, topicName, difficulty, lastError = "", lastResponse = "", history = [], questionIndex = 0) {
  const isEnglish = (subjectName || "").toLowerCase().includes('english') || (topicName && topicName.toLowerCase().includes('english'));
  const isHindi = (subjectName || "").toLowerCase().includes('hindi') || (topicName && topicName.toLowerCase().includes('hindi'));

  const errorFeedback = lastError ? `
### ⚠️ FIX PREVIOUS JSON ERROR:
Error: ${lastError}
Ensure all quotes are escaped and no illegal backslashes are used.
Previous Response Snippet: ${lastResponse ? `"${lastResponse}..."` : "None"}
` : "";

  const recentHistory = history.slice(-40); // Increased history context for AI
  const historyList = recentHistory.length > 0
    ? `\n### 🛑 EXCLUSION LIST (DO NOT GENERATE ANYTHING SIMILAR TO THESE):\n${recentHistory.map((h, i) => `${i + 1}. [${h.topic}]: ${h.summary}...`).join('\n')}`
    : "";

  let taskText = "";
  if (topicName) {
    taskText = `Create 1 NEW, UNIQUE MCQ for the topic "${topicName}" within the subject "${subjectName}" (${difficulty} level) that is not present in historyList.`;
  } else {
    taskText = `Create 1 NEW, UNIQUE MCQ for the subject "${subjectName}" (${difficulty} level) that is not present in historyList.`;
  }

  // Determine language generation rules
  let languageInstructions = "";
  if (isHindi) {
    languageInstructions = `\n### 🌐 LANGUAGE INSTRUCTIONS:
- This is a Hindi-related subject/topic ("${subjectName}").
- BOTH the "en" and "hi" objects MUST contain the question, options, answer, and solution written in Hindi language. Do NOT translate this question into English. Copy the Hindi content as-is into BOTH fields.`;
  } else if (isEnglish) {
    languageInstructions = `\n### 🌐 LANGUAGE INSTRUCTIONS:
- This is an English-related subject/topic ("${subjectName}").
- BOTH the "en" and "hi" objects MUST contain the question, options, answer, and solution written in English language. Do NOT translate this question into Hindi. Copy the English content as-is into BOTH fields.`;
  } else {
    languageInstructions = `\n### 🌐 LANGUAGE INSTRUCTIONS:
- The "en" object must contain the question, options, answer, and solution in English.
- The "hi" object must contain the question, options, answer, and solution in Hindi.`;
  }

  return `You are a high-level question developer for the "${examName}" exam.
  Randomness Seed: ${Math.floor(Math.random() * 100000) + 1}
  Task: ${taskText}
${languageInstructions}

${errorFeedback}
${historyList}

**ZERO TOLERANCE REPETITION POLICY:**
1. **NO REPEATS:** You must NOT generate any question that matches the logic, numbers, scenario, or phrasing of the questions in the EXCLUSION LIST above.  
2. **Fresh sub-topic:** Pick a specific sub-topic or a different application of the concept from the ones already used.
3. **Randomized Options:** Correct answer index must be varied. For this question #${questionIndex + 1}, try placing it in a position that feels balanced (A, B, C, or D).
4. **JSON Format:** Return ONLY a raw JSON object. No markdown.

**JSON Schema:**
{
  "en": {
    "Question": "Question text (must match the language rules specified under LANGUAGE INSTRUCTIONS)",
    "options": [
      { "text": "Choice A", "isCorrect": false },
      { "text": "Choice B", "isCorrect": false },
      { "text": "Choice C", "isCorrect": false },
      { "text": "Choice D", "isCorrect": false }
    ],
    "answer": "Exact text of the correct choice",
    "solution": "Detailed step-by-step explanation"
  },
  "hi": {
    "Question": "Question text (must match the language rules specified under LANGUAGE INSTRUCTIONS)",
    "options": [
      { "text": "विकल्प A", "isCorrect": false },
      { "text": "विकल्प B", "isCorrect": false },
      { "text": "विकल्प C", "isCorrect": false },
      { "text": "विकल्प D", "isCorrect": false }
    ],
    "answer": "सही विकल्प का सटीक टेक्स्ट",
    "solution": "विस्तृत हिन्दी व्याख्या"
  },
  "Topic": "${topicName ? topicName : 'Specific sub-topic name'}"
}
FINAL CHECK: Is this question identical to anything in the exclusion list? If yes, change it completely. Return valid JSON.`;
}





export const fetchGenerations = async (req, res) => {
  try {
    const generations = await MockTestModel.find({ type: 'mock_test' })
      .populate('Questions')
      .populate('ExamId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, generations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch past generations" });
  }
};

export const deleteGeneration = async (req, res) => {
  const { testId } = req.params;
  try {
    const test = await MockTestModel.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test generation not found" });
    }

    // 1. Delete associated submissions
    await TestSubmissionModel.deleteMany({ testId: testId });

    // 2. Remove from Exam Model's arrays if published
    if (test.Status === 'Published') {
      const updateField = test.type === 'mock_test' ? 'MockTests' : 'Quizzes';
      await examModel.findByIdAndUpdate(test.ExamId, {
        $pull: { [updateField]: testId }
      });
    }

    // 3. Delete the test itself
    await MockTestModel.findByIdAndDelete(testId);

    res.status(200).json({ success: true, message: "Test generation deleted successfully" });
  } catch (err) {
    console.error("Delete generation error:", err);
    res.status(500).json({ success: false, message: "Failed to delete test generation" });
  }
};

export const publishGeneration = async (req, res) => {
  const { testId } = req.params;
  try {
    const test = await MockTestModel.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test generation not found" });
    }

    if (test.type === 'mock_test') {
      test.Status = 'Published';
      await test.save();

      const exam = await examModel.findById(test.ExamId);
      if (exam) {
        if (!exam.MockTests.includes(test._id)) {
          exam.MockTests.push(test._id);
          await exam.save();
        }
      }
      res.status(200).json({ success: true, message: "Test generation published successfully" });
    } else {
      test.Status = 'Published';
      await test.save();
      res.status(200).json({ success: true, message: "Quiz marked as published" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to publish test generation" });
  }
};

export const fetchMockTestsByExam = async (req, res) => {
  const { examId } = req.params;
  try {
    const mocks = await MockTestModel.find({ ExamId: examId, type: 'mock_test' })
      .populate('Questions')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, mocks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch mock tests for this exam" });
  }
};

export const fetchSubjectsForExam = async (req, res) => {
  const { examId } = req.body;
  try {
    const exam = await examModel.findById(examId);
    if (!exam) {
      res.status(404).json({ success: false, message: "Exam not found" });
      return;
    }
    res.status(200).json({ success: true, Subjects: exam.Subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch subjects for exam" });
  }
}

// ==========================================
// START: BULK DELETE QUIZZES BY DATE FUNCTIONALITY
// This section can be removed if bulk delete is no longer needed.
// ==========================================
export const bulkDeleteQuizzesByDate = async (req, res) => {
  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ success: false, message: "Date is required" });
  }

  try {
    const expiryDate = new Date(date);
    expiryDate.setHours(23, 59, 59, 999); // Include the entire day

    // 1. Find all quizzes created up to the date
    const quizzesToDelete = await MockTestModel.find({
      type: 'quiz',
      createdAt: { $lte: expiryDate }
    }).select('_id Questions ExamId Status');

    if (quizzesToDelete.length === 0) {
      return res.status(200).json({ success: true, message: "No quizzes found for the selected date range" });
    }

    const quizIds = quizzesToDelete.map(q => q._id);
    const questionIds = quizzesToDelete.reduce((acc, q) => acc.concat(q.Questions || []), []);

    // 2. Delete Submissions
    await TestSubmissionModel.deleteMany({ testId: { $in: quizIds } });

    // 3. Delete Questions
    await QuestionModel.deleteMany({ _id: { $in: questionIds } });

    // 4. Remove references from ExamModel
    const examMap = quizzesToDelete.reduce((acc, q) => {
      if (q.Status === 'Published') {
        if (!acc[q.ExamId]) acc[q.ExamId] = [];
        acc[q.ExamId].push(q._id);
      }
      return acc;
    }, {});

    for (const [examId, ids] of Object.entries(examMap)) {
      await examModel.findByIdAndUpdate(examId, {
        $pull: { Quizzes: { $in: ids } }
      });
    }

    // 5. Delete Quizzes
    await MockTestModel.deleteMany({ _id: { $in: quizIds } });

    res.status(200).json({ success: true, message: `Successfully deleted ${quizzesToDelete.length} quizzes and related data.` });
  } catch (err) {
    console.error("Bulk delete quizzes error:", err);
    res.status(500).json({ success: false, message: "Failed to perform bulk deletion" });
  }
};
// ==========================================
// END: BULK DELETE QUIZZES BY DATE FUNCTIONALITY
// ==========================================