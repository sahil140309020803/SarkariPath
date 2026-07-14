import { adminAI } from './AdminGeminiService.js';
import { getAdminMultipleQuestionsPrompt } from './AdminPromptBuilder.js';
import { parseAdminQuestions } from './AdminQuestionParser.js';
import { MockTestModel, QuestionModel, examModel } from '../../models/ExamModel.js';
import { fetchAndCloneCurrentAffairsQuestions } from '../currentAffairs/CurrentAffairsService.js';

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

const SLEEP_TIME = 4000;

export const generateAdminMockTest = async (io, socketId, data) => {
  const { title, examId, rules, difficulty, negativeMarks, totalMarks, duration, marksPerQuestion } = data;
  const socket = io.sockets.sockets.get(socketId);

  const emitProgress = (payload) => {
    if (socket) socket.emit('generation_progress', payload);
  };
  const emitComplete = (payload) => {
    if (socket) socket.emit('generation_complete', payload);
  };
  const emitError = (payload) => {
    if (socket) socket.emit('generation_error', payload);
  };

  const totalRequired = rules.reduce((acc, rule) => acc + (parseInt(rule.count) || 0), 0);
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    let examNameOrFallback = "Competitive Exam";
    let examDoc = await examModel.findById(examId);
    if (examDoc) {
      examNameOrFallback = examDoc.Name;
    }

    let activeTest = await MockTestModel.findOne({
      Title: title,
      ExamId: examId,
      Status: 'Draft'
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
        DurationinMinutes: duration || 60
      });
      await activeTest.save();
    }

    console.log(`[AdminGeneration] Job Created for Mock Test: ${activeTest._id}`);

    let sessionHistory = [];
    if (activeTest.Questions && activeTest.Questions.length > 0) {
      sessionHistory = activeTest.Questions.map(q => ({
        topic: q.Topic,
        summary: (q.en?.Question || q.hi?.Question || "").substring(0, 50)
      }));
    }

    for (const rule of rules) {
      const currentTestState = await MockTestModel.findById(activeTest._id).populate('Questions');
      const existingSubjectQuestions = currentTestState.Questions.filter(q => q.Subject === rule.name || q.Topic === rule.name);

      let questionsGeneratedForRule = existingSubjectQuestions.length;

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
        summary: (q.en?.Question || q.hi?.Question || "").substring(0, 100)
      }));

      const fullHistory = [...globalHistory, ...sessionHistory];

      const subjectTopics = (examDoc && examDoc.Topics && examDoc.Topics[rule.name])
        ? examDoc.Topics[rule.name]
        : [];

      while (questionsGeneratedForRule < rule.count) {
        const remainingForRule = rule.count - questionsGeneratedForRule;
        const countToGenerate = Math.min(5, remainingForRule);

        console.log(`[AdminGeneration] Request Sent for Mock Test ${activeTest._id} to generate ${countToGenerate} questions.`);
        emitProgress({
          count: activeTest.Questions.length,
          total: totalRequired,
          status: `Processing ${rule.name}...`
        });

        let selectedTopics = [];
        if (subjectTopics.length > 0) {
          const shuffled = [...subjectTopics].sort(() => 0.5 - Math.random());
          selectedTopics = shuffled.slice(0, countToGenerate);
          while (selectedTopics.length < countToGenerate) {
            const randomTopic = subjectTopics[Math.floor(Math.random() * subjectTopics.length)];
            selectedTopics.push(randomTopic);
          }
        }

        let batchQuestions = [];
        let remainingTopicsForBatch = [...selectedTopics];

        // Intercept Current Affairs topics to load directly from MongoDB
        const caIndices = [];
        remainingTopicsForBatch.forEach((t, idx) => {
          if ((t && t.toLowerCase().includes('current affairs')) || (rule.name && rule.name.toLowerCase().includes('current affairs'))) {
            caIndices.push(idx);
          }
        });

        if (caIndices.length > 0) {
          console.log(`[AdminGeneration] Current Affairs requested. Fetching ${caIndices.length} questions from DB...`);
          const excludeIds = activeTest.Questions ? activeTest.Questions.map(q => q._id || q) : [];
          const dbQuestions = await fetchAndCloneCurrentAffairsQuestions(
            examId,
            difficulty || 'Medium',
            caIndices.length,
            excludeIds
          );

          console.log(`[AdminGeneration] Fetched ${dbQuestions.length} Current Affairs questions from DB.`);
          
          if (dbQuestions.length > 0) {
            batchQuestions.push(...dbQuestions);
            for (let i = remainingTopicsForBatch.length - 1; i >= 0; i--) {
              const t = remainingTopicsForBatch[i];
              if ((t && t.toLowerCase().includes('current affairs')) || (rule.name && rule.name.toLowerCase().includes('current affairs'))) {
                remainingTopicsForBatch.splice(i, 1);
              }
            }
          }
        }

        let retryCount = 0;
        const MAX_RETRIES = 3;

        while (batchQuestions.length < countToGenerate && retryCount < MAX_RETRIES) {
          const neededInBatch = countToGenerate - batchQuestions.length;
          try {
            const prompt = getAdminMultipleQuestionsPrompt(
              examNameOrFallback,
              rule.name,
              remainingTopicsForBatch,
              difficulty || 'Medium',
              fullHistory,
              neededInBatch
            );

            const result = await withTimeout(adminAI.generateContent(prompt), 35000);
            const aiResponseString = result.response.candidates[0].content.parts[0].text;

            const parsedQuestions = parseAdminQuestions(aiResponseString);

            const validQuestions = [];
            for (const q of parsedQuestions) {
              if (q.en || q.hi) {
                validQuestions.push(q);
                const idx = remainingTopicsForBatch.indexOf(q.Topic);
                if (idx !== -1) {
                  remainingTopicsForBatch.splice(idx, 1);
                }
              }
            }

            batchQuestions.push(...validQuestions);

            if (validQuestions.length === 0) {
              retryCount++;
            }
          } catch (err) {
            console.error(`[AdminGeneration] Failed batch generation attempt ${retryCount + 1}: ${err.message}`);
            retryCount++;
            if (retryCount >= MAX_RETRIES && batchQuestions.length === 0) {
              throw new Error(`AI generation failed after ${MAX_RETRIES} attempts. Error: ${err.message}`);
            }
          }
        }

        console.log(`[AdminGeneration] Request Completed. Successfully generated ${batchQuestions.length} questions for this batch.`);

        const savedQuestionIds = [];
        for (const questionData of batchQuestions) {
          const newQuestion = new QuestionModel({
            ...questionData,
            ExamId: examId,
            Subject: rule.name,
            Topic: questionData.Topic,
            Difficulty: difficulty || 'Medium'
          });

          await newQuestion.validate();
          await newQuestion.save();

          savedQuestionIds.push(newQuestion._id);

          const summary = (questionData.en?.Question || "").substring(0, 100);
          sessionHistory.push({ topic: questionData.Topic, summary });
          fullHistory.push({ topic: questionData.Topic, summary });
        }

        activeTest = await MockTestModel.findByIdAndUpdate(
          activeTest._id,
          { $push: { Questions: { $each: savedQuestionIds } } },
          { new: true }
        );

        questionsGeneratedForRule += savedQuestionIds.length;

        console.log(`[AdminGeneration] Sleeping ${SLEEP_TIME / 1000} seconds before next request...`);
        await sleep(SLEEP_TIME);
      }
    }

    emitComplete({ message: 'Generated Successfully!', test: activeTest });
    console.log(`[AdminGeneration] Mock test generation completed: ${activeTest._id}`);

  } catch (error) {
    console.error("[AdminGeneration] Error in generateAdminMockTest:", error);
    emitError({ message: error.message });
  }
};
