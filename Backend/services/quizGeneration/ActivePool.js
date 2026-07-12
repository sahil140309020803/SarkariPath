import { SCHEDULER_CONFIG } from './config.js';

export class ActivePool {
  constructor() {
    this.jobs = [];
    this.currentIndex = 0;
  }

  add(job) {
    if (this.jobs.length >= SCHEDULER_CONFIG.ACTIVE_POOL_SIZE) {
      return false;
    }
    job.state = 'active';
    job.admittedAt = Date.now();
    this.jobs.push(job);
    console.log(`[ActivePool] Job ${job.jobId} Entered Active Pool.`);
    return true;
  }

  remove(jobId) {
    const index = this.jobs.findIndex(j => j.jobId === jobId);
    if (index !== -1) {
      const [removed] = this.jobs.splice(index, 1);
      console.log(`[ActivePool] Job ${jobId} removed from Active Pool.`);
      if (this.currentIndex >= this.jobs.length) {
        this.currentIndex = 0;
      }
      return removed;
    }
    return null;
  }

  size() {
    return this.jobs.length;
  }

  hasCapacity() {
    return this.jobs.length < SCHEDULER_CONFIG.ACTIVE_POOL_SIZE;
  }
}

export const activePool = new ActivePool();
