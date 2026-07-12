export class Job {
  constructor(jobId, socket, io, data, activeTest) {
    this.jobId = jobId;
    this.socket = socket;
    this.io = io;
    this.data = data;
    this.activeTest = activeTest;
    this.state = 'waiting'; // 'waiting', 'active', 'generating', 'completed', 'failed'
    this.questionsGenerated = 0;
    this.totalQuestions = data.totalQuestions || 15;
    this.retryCount = 0;
    this.createdAt = Date.now();
    this.admittedAt = null;
    this.sessionHistory = [];
    this.fullHistory = [];
    this.currentRuleIndex = 0;
    this.questionsGeneratedForCurrentRule = 0;
    
    console.log(`[JobManager] Job Created: ${this.jobId}`);
  }
}
