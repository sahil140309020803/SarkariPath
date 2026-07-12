import { queueManager } from './QueueManager.js';
import { activePool } from './ActivePool.js';
import { scheduler } from './GenerationScheduler.js';
import { QuizModel, examModel } from '../../models/ExamModel.js';
import { SCHEDULER_CONFIG } from './config.js';
import { Job } from './JobManager.js';

export const handleStartQuizGeneration = async (socket, io, data) => {
  const { title, examId, rules, difficulty, negativeMarks, totalMarks, duration, subjectName, topicName, examName } = data;
  
  const totalRequired = rules.reduce((acc, rule) => acc + (parseInt(rule.count) || 0), 0);
  
  try {
    let examNameOrFallback = examName || "Competitive Exam";
    let examDoc = await examModel.findById(examId);
    if (examDoc) {
      examNameOrFallback = examDoc.Name;
    }

    const newQuiz = new QuizModel({
      Title: title,
      ExamId: examId,
      Difficulty: difficulty || 'Medium',
      NegativeMarks: negativeMarks || 0,
      Questions: [],
      TotalMarks: totalMarks || totalRequired,
      DurationinMinutes: duration || 20,
      status: 'Waiting',
      expireAt: new Date(Date.now() + SCHEDULER_CONFIG.QUIZ_EXPIRY_DURATION)
    });
    
    await newQuiz.save();
    console.log(`[SchedulerEvents] Quiz Document Saved: ${newQuiz._id}`);

    const job = new Job(newQuiz._id.toString(), socket, io, {
      ...data,
      totalQuestions: totalRequired,
      examName: examNameOrFallback
    }, newQuiz);

    queueManager.enqueue(job);
    
    // Cleanup if socket disconnects
    const disconnectHandler = () => {
      console.log(`[SchedulerEvents] Socket disconnected for job ${newQuiz._id}`);
      cancelQuizJob(newQuiz._id.toString());
    };
    socket.on('disconnect', disconnectHandler);

    // Notify user immediately of waiting state
    const position = queueManager.getJobPosition(newQuiz._id.toString());
    const waitTime = Math.ceil((position * 3 * 8) / SCHEDULER_CONFIG.ACTIVE_POOL_SIZE);
    
    socket.emit('generation_progress', {
      status: 'waiting',
      queuePosition: position,
      estimatedWaitSeconds: waitTime
    });

    // Start loop
    scheduler.start();

  } catch (error) {
    console.error("[SchedulerEvents] Error starting quiz generation:", error);
    socket.emit('generation_error', { message: error.message });
  }
};

export const cancelQuizJob = async (jobId) => {
  console.log(`[SchedulerEvents] Cancelling quiz generation: ${jobId}`);
  
  let removedJob = queueManager.remove(jobId);
  if (!removedJob) {
    removedJob = activePool.remove(jobId);
  }
  
  if (removedJob) {
    removedJob.state = 'failed';
    removedJob.socket.emit('generation_error', { message: "Generation stopped by system/user disconnect." });
    
    try {
      await QuizModel.findByIdAndDelete(jobId);
    } catch (err) {
      console.error("[SchedulerEvents] Error removing quiz doc:", err);
    }
  }
};
