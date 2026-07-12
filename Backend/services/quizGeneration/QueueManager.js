export class QueueManager {
  constructor() {
    this.queue = [];
  }

  enqueue(job) {
    job.state = 'waiting';
    this.queue.push(job);
    console.log(`[QueueManager] Job ${job.jobId} Entered Queue.`);
  }

  dequeue() {
    if (this.queue.length === 0) return null;
    return this.queue.shift();
  }

  remove(jobId) {
    const index = this.queue.findIndex(j => j.jobId === jobId);
    if (index !== -1) {
      const [removed] = this.queue.splice(index, 1);
      console.log(`[QueueManager] Job ${jobId} removed from queue.`);
      return removed;
    }
    return null;
  }

  getJobPosition(jobId) {
    return this.queue.findIndex(j => j.jobId === jobId) + 1;
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  size() {
    return this.queue.length;
  }
}

export const queueManager = new QueueManager();
