import { QuizModel, QuestionModel, examModel } from '../../models/ExamModel.js';
import { SCHEDULER_CONFIG } from './config.js';
import { queueManager } from './QueueManager.js';
import { activePool } from './ActivePool.js';
import { rateLimiter } from './RateLimiter.js';
import { quizAI } from './GeminiQuizService.js';
import { getQuizMultipleQuestionsPrompt } from './PromptBuilder.js';
import { parseQuizQuestions } from './QuestionParser.js';

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

export class GenerationScheduler {
  constructor() {
    this.isLoopRunning = false;
  }

  start() {
    if (this.isLoopRunning) return;
    this.isLoopRunning = true;
    console.log("[GenerationScheduler] Starting scheduler loop.");
    this.loop();
  }

  async loop() {
    while (true) {
      try {
        // Refill Active Pool from Queue
        while (activePool.hasCapacity() && !queueManager.isEmpty()) {
          const nextJob = queueManager.dequeue();
          if (nextJob) {
            activePool.add(nextJob);
            nextJob.state = 'active';
            await QuizModel.findByIdAndUpdate(nextJob.jobId, { status: 'Active' });
            console.log(`[GenerationScheduler] Job Entered Active Pool: ${nextJob.jobId}`);
            this.broadcastQueuePositions();
          }
        }

        if (activePool.size() === 0) {
          this.isLoopRunning = false;
          console.log("[GenerationScheduler] Active pool is empty. Stopping loop.");
          break;
        }

        // Get current job in Active Pool
        const job = activePool.jobs[activePool.currentIndex];
        
        if (job) {
          console.log(`[GenerationScheduler] Round Robin Switched User to Job: ${job.jobId}`);
          
          await this.executeJobTurn(job);
          
          if (job.state === 'completed' || job.state === 'failed') {
            activePool.remove(job.jobId);
          } else {
            activePool.currentIndex = (activePool.currentIndex + 1) % activePool.size();
          }
        } else {
          activePool.currentIndex = 0;
        }

      } catch (err) {
        console.error("[GenerationScheduler] Error in scheduler loop:", err);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  async executeJobTurn(job) {
    job.state = 'generating';
    await QuizModel.findByIdAndUpdate(job.jobId, { status: 'Generating' });
    console.log(`[GenerationScheduler] Round Robin Started for Job: ${job.jobId}`);

    const remaining = job.totalQuestions - job.questionsGenerated;
    const countToGenerate = Math.min(SCHEDULER_CONFIG.QUESTIONS_PER_REQUEST, remaining);
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      console.log(`[GenerationScheduler] Request Sent for Job ${job.jobId} to generate ${countToGenerate} questions.`);
      
      const questionsData = await rateLimiter.execute(async () => {
        console.log(`[RateLimiter] Token Consumed for Job ${job.jobId}`);
        return await this.generateQuestionsFromAI(job, countToGenerate);
      });
      
      console.log(`[GenerationScheduler] Request Completed for Job ${job.jobId}.`);
      
      await this.saveQuestionsToJob(job, questionsData);
      
      if (job.questionsGenerated >= job.totalQuestions) {
        job.state = 'completed';
        await QuizModel.findByIdAndUpdate(job.jobId, { status: 'Completed' });
        console.log(`[GenerationScheduler] Job Completed: ${job.jobId}`);
        job.socket.emit('generation_complete', { message: 'Generated Successfully!', test: job.activeTest });
      } else {
        const progressPercent = Math.round((job.questionsGenerated / job.totalQuestions) * 100);
        job.socket.emit('generation_progress', {
          status: 'generating',
          generatedQuestions: job.questionsGenerated,
          totalQuestions: job.totalQuestions,
          progress: progressPercent
        });
      }
      
    } catch (err) {
      console.error(`[GenerationScheduler] Error generating questions for Job ${job.jobId}:`, err);
      job.retryCount++;
      if (job.retryCount >= SCHEDULER_CONFIG.MAX_RETRIES) {
        job.state = 'failed';
        await QuizModel.findByIdAndUpdate(job.jobId, { status: 'Failed' });
        console.log(`[GenerationScheduler] Job Failed: ${job.jobId}`);
        job.socket.emit('generation_error', { message: `Quiz generation failed: ${err.message}` });
        
        try {
          await QuizModel.findByIdAndDelete(job.jobId);
        } catch (dbErr) {
          console.error("Failed to delete failed quiz document:", dbErr);
        }
      } else {
        job.state = 'active';
        await QuizModel.findByIdAndUpdate(job.jobId, { status: 'Active' });
      }
    }

    // Sleep 1 second before next turn to allow socket processing and clean pacing
    await sleep(1000);
  }

  async generateQuestionsFromAI(job, countToGenerate) {
    const rules = job.data.rules;
    let ruleIndex = job.currentRuleIndex;
    let ruleGenCount = job.questionsGeneratedForCurrentRule;
    
    while (ruleIndex < rules.length && ruleGenCount >= rules[ruleIndex].count) {
      ruleIndex++;
      ruleGenCount = 0;
    }
    
    if (ruleIndex >= rules.length) {
      throw new Error("All rules satisfied, no more questions needed.");
    }
    
    const activeRule = rules[ruleIndex];
    const ruleRemaining = activeRule.count - ruleGenCount;
    const currentBatchCount = Math.min(countToGenerate, ruleRemaining);
    
    job.currentRuleIndex = ruleIndex;
    job.questionsGeneratedForCurrentRule = ruleGenCount;

    // Load global history for active rule/subject
    if (job.fullHistory.length === 0) {
      const previousQuestions = await QuestionModel.find({
        ExamId: job.data.examId,
        $or: [
          { Subject: activeRule.name },
          { Topic: activeRule.name }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(60)
        .select('Topic en.Question hi.Question');

      const globalHistory = previousQuestions.map(q => ({
        topic: q.Topic,
        summary: (q.en?.Question || q.hi?.Question || "").substring(0, 100)
      }));
      job.fullHistory = [...globalHistory, ...job.sessionHistory];
    }

    let examNameOrFallback = job.data.examName || "Competitive Exam";
    let examDoc = await examModel.findById(job.data.examId);
    
    // Choose topics for this batch
    let selectedTopics = [];
    if (job.data.topicName) {
      // Case 1: Topic-wise Quiz
      selectedTopics = Array(currentBatchCount).fill(job.data.topicName);
    } else {
      // Case 2: Subject-wise Quiz (No topic selected)
      const subjectTopics = (examDoc && examDoc.Topics && examDoc.Topics[activeRule.name]) 
        ? examDoc.Topics[activeRule.name] 
        : [];

      if (subjectTopics.length > 0) {
        // Randomly select unique topics
        const shuffled = [...subjectTopics].sort(() => 0.5 - Math.random());
        selectedTopics = shuffled.slice(0, currentBatchCount);
        while (selectedTopics.length < currentBatchCount) {
          const randomTopic = subjectTopics[Math.floor(Math.random() * subjectTopics.length)];
          selectedTopics.push(randomTopic);
        }
      }
    }

    // Fallback: retry only missing questions in the batch
    let batchQuestions = [];
    let remainingTopicsForBatch = [...selectedTopics];
    let retryCount = 0;
    const MAX_RETRIES = 3;

    while (batchQuestions.length < currentBatchCount && retryCount < MAX_RETRIES) {
      const neededInBatch = currentBatchCount - batchQuestions.length;
      try {
        const prompt = getQuizMultipleQuestionsPrompt(
          examNameOrFallback,
          job.data.subjectName || activeRule.name,
          remainingTopicsForBatch,
          job.data.difficulty || 'Medium',
          job.fullHistory,
          neededInBatch
        );

        const result = await withTimeout(quizAI.generateContent(prompt), 35000);
        const aiResponseString = result.response.candidates[0].content.parts[0].text;

        const parsedQuestions = parseQuizQuestions(aiResponseString);
        
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
        console.error(`[GenerationScheduler] Failed batch quiz attempt ${retryCount + 1}: ${err.message}`);
        retryCount++;
        if (retryCount >= MAX_RETRIES && batchQuestions.length === 0) {
          throw new Error(`AI generation failed for quiz after ${MAX_RETRIES} attempts. Error: ${err.message}`);
        }
      }
    }

    return {
      questions: batchQuestions,
      activeRule,
      selectedTopics
    };
  }

  async saveQuestionsToJob(job, questionsData) {
    const { questions, activeRule, selectedTopics } = questionsData;
    const savedQuestionIds = [];
    
    for (const questionData of questions) {
      const newQuestion = new QuestionModel({
        ...questionData,
        ExamId: job.data.examId,
        Subject: job.data.subjectName || activeRule.name,
        Topic: questionData.Topic || selectedTopics[savedQuestionIds.length] || activeRule.name,
        Difficulty: job.data.difficulty || 'Medium',
        expireAt: job.activeTest.expireAt
      });
      
      await newQuestion.validate();
      await newQuestion.save();
      
      savedQuestionIds.push(newQuestion._id);
      
      const questionSummary = (questionData.en?.Question || "").substring(0, 100);
      job.sessionHistory.push({
        topic: questionData.Topic,
        summary: questionSummary
      });
      
      job.fullHistory.push({
        topic: questionData.Topic,
        summary: questionSummary
      });
    }
    
    job.activeTest = await QuizModel.findByIdAndUpdate(
      job.jobId,
      { $push: { Questions: { $each: savedQuestionIds } } },
      { new: true }
    );
    
    job.questionsGenerated += savedQuestionIds.length;
    job.questionsGeneratedForCurrentRule += savedQuestionIds.length;
    
    if (job.questionsGeneratedForCurrentRule >= activeRule.count) {
      job.currentRuleIndex++;
      job.questionsGeneratedForCurrentRule = 0;
      job.fullHistory = []; // Reset to load history for next rule
    }
  }

  broadcastQueuePositions() {
    queueManager.queue.forEach((job, index) => {
      const position = index + 1;
      const waitTime = Math.ceil((position * 3 * 8) / SCHEDULER_CONFIG.ACTIVE_POOL_SIZE); 
      job.socket.emit('generation_progress', {
        status: 'waiting',
        queuePosition: position,
        estimatedWaitSeconds: waitTime
      });
    });
  }
}

export const scheduler = new GenerationScheduler();
