import { AI } from '../GenAI/ai.js';
import { MockTestModel, QuestionModel, examModel } from '../models/ExamModel.js';

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

const activeGenerations = new Map();

export const setupSocketHandlers = (socket, io) => {
  
  socket.on('stop_generation', (testId) => {
    activeGenerations.set(testId, false);
    socket.emit('generation_status', { message: "Stopping... Please wait." });
  });

  socket.on('start_generation', async (data) => {
    const { title, examId, rules, difficulty, negativeMarks, duration, totalMarks, type } = data;
    
    let activeTest;
    const totalRequired = rules.reduce((acc, rule) => acc + (parseInt(rule.count) || 0), 0);
    const testType = type === 'quiz' ? 'quiz' : 'mock_test'; // Default to mock_test

    try {
      if (testType === 'quiz') {

        activeTest = new MockTestModel({
          Title: title,
          ExamId: examId,
          Status: 'Published', // Quizzes are ready immediately
          Difficulty: difficulty || 'Medium',
          NegativeMarks: negativeMarks || 0,
          Structure: rules.map(r => ({ Subject: r.name, QuestionCount: r.count })),
          Questions: [],
          TotalMarks: totalMarks || totalRequired,
          DurationinMinutes: duration || 20,
          type: 'quiz'
        });
        await activeTest.save();

      } else {
        
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
            TotalMarks: totalMarks || totalRequired,
            DurationinMinutes: duration, 
            type: 'mock_test'
          });
          await activeTest.save();
        }
      }

      activeGenerations.set(activeTest._id.toString(), true);

      let generatedHistory = [];
      if (activeTest.Questions && activeTest.Questions.length > 0) {
          if(activeTest.Questions[0] instanceof QuestionModel) {
             generatedHistory = activeTest.Questions.map(q => ({
                topic: q.Topic,
                summary: (q.en?.Question || q.hi?.Question || "").substring(0, 50)
             }));
          } else if (activeTest.Questions.length > 0) {

             const loadedQuestions = await QuestionModel.find({ _id: { $in: activeTest.Questions } });
             generatedHistory = loadedQuestions.map(q => ({
                topic: q.Topic,
                summary: (q.en?.Question || q.hi?.Question || "").substring(0, 50)
             }));
          }
      }

      for (const rule of rules) {
        const currentTestState = await MockTestModel.findById(activeTest._id).populate('Questions');
        
        const existingSubjectQuestions = currentTestState.Questions.filter(q => q.Subject === rule.name);
        const remainingCount = rule.count - existingSubjectQuestions.length;

        for (let i = 0; i < remainingCount; i++) {
          if (activeGenerations.get(activeTest._id.toString()) === false) throw new Error("Cancelled.");

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

              const prompt = getSingleQuestionPrompt(examId, rule.name, difficulty, lastError, lastResponse, generatedHistory);
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
                Subject: rule.name, 
                Difficulty: difficulty 
              });
              
              await newQuestion.validate();
              await newQuestion.save();
              
              // Push new question ID to the MockTestModel
              activeTest = await MockTestModel.findByIdAndUpdate(
                activeTest._id, 
                { $push: { Questions: newQuestion._id } },
                { new: true }
              );

              generatedHistory.push({
                topic: questionData.Topic,
                summary: (questionData.en?.Question || "").substring(0, 40)
              });
              console.log(`Generated ${i + 1}/${totalRequired} for ${rule.name}`)
              questionGenerated = true;
            } catch (error) {
              retryCount++;
              lastError = error.message;
              console.error(`Attempt ${retryCount} failed: ${error.message}`);
              if (retryCount >= MAX_RETRIES) throw new Error(`Generation failed: ${error.message}`);
            }
          }
        }
      }
      socket.emit('generation_complete', { message: 'Generated Successfully!', test: activeTest });
    } catch (error) {
      console.error(error);
      socket.emit('generation_error', { message: error.message });
    }
  });
};

function getSingleQuestionPrompt(exam, subject, difficulty, lastError = "", lastResponse = "", history = []) {
  const isEnglish = subject.toLowerCase().includes('english');
  const isHindi = subject.toLowerCase().includes('hindi');

  const errorFeedback = lastError ? `
### ⚠️ FIX PREVIOUS JSON ERROR:
Error: ${lastError}
Ensure all quotes are escaped and no illegal backslashes are used.
Previous Response Snippet: ${lastResponse ? `"${lastResponse}..."` : "None"}
` : "";

  const recentHistory = history.slice(-15);
  const historyList = recentHistory.length > 0
    ? `\n### 🛑 DO NOT REPEAT THESE TOPICS/QUESTIONS:\n${recentHistory.map((h, i) => `- ${h.topic}: ${h.summary}...`).join('\n')}`
    : "";

  return `You are an expert question designer for the "${exam}" exam.
Task: Generate 1 unique MCQ for "${subject}" (${difficulty} level).

${errorFeedback}
${historyList}

**STRICT UNIQUENESS & QUALITY RULES:**
1. **No Duplicates:** The question must be conceptually different from the history list above.
2. **Specific Topic:** Pick a specific sub-topic.
3. **JSON Format:** Return ONLY a raw JSON object. No markdown blocks.
4. **Escaping:** Use "\\n" for newlines and "\\\\" for math backslashes.
5. **JSON Safety:** If the question involves Math/Science, you MUST use double backslashes for all symbols (e.g., "\\\\sqrt{x}").

**JSON Schema:**
{
  "en": ${isHindi ? 'null' : `{
    "Question": "Question in English",
    "options": [
      { "text": "Option A", "isCorrect": false },
      { "text": "Option B", "isCorrect": true },
      { "text": "Option C", "isCorrect": false },
      { "text": "Option D", "isCorrect": false }
    ],
    "answer": "Option B",
    "solution": "Brief explanation"
  }`},
  "hi": ${isEnglish ? 'null' : `{
    "Question": "हिन्दी में प्रश्न",
    "options": [
      { "text": "विकल्प ए", "isCorrect": false },
      { "text": "विकल्प बी", "isCorrect": true },
      { "text": "विकल्प सी", "isCorrect": false },
      { "text": "विकल्प डी", "isCorrect": false }
    ],
    "answer": "विकल्प बी",
    "solution": "हिन्दी में व्याख्या"
  }`},
  "Topic": "Name of the sub-topic"
}`;
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
    await MockTestModel.findByIdAndDelete(testId);
    
    if (test.type === 'mock_test' && test.Status === 'Published') {
        const exam = await examModel.findById(test.ExamId);
        if(exam && exam.MockTests) {
            exam.MockTests = exam.MockTests.filter(tid => tid.toString() !== testId);
            await exam.save();
        }
    }
    res.status(200).json({ success: true, message: "Test generation deleted successfully" });
  } catch (err) {
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
        if(exam) {
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