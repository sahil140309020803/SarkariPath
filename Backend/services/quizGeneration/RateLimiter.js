import { SCHEDULER_CONFIG } from './config.js';

export class RateLimiter {
  constructor(maxRequestsPerMinute) {
    this.maxRequests = maxRequestsPerMinute;
    this.tokens = maxRequestsPerMinute;
    this.replenishIntervalMs = (60 * 1000) / maxRequestsPerMinute;
    this.queue = [];
    this.lastReplenished = Date.now();
    
    // Periodically replenish tokens
    this.intervalId = setInterval(() => this.replenish(), 500);
  }

  replenish() {
    const now = Date.now();
    const timePassed = now - this.lastReplenished;
    
    const tokensToAdd = timePassed / this.replenishIntervalMs;
    if (tokensToAdd >= 1) {
      this.tokens = Math.min(this.maxRequests, this.tokens + Math.floor(tokensToAdd));
      this.lastReplenished = now - (timePassed % this.replenishIntervalMs);
      this.processQueue();
    }
  }

  async execute(fn) {
    return new Promise((resolve, reject) => {
      console.log(`[RateLimiter] Waiting For Token... Queue size: ${this.queue.length + 1}`);
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    while (this.queue.length > 0 && this.tokens >= 1) {
      this.tokens -= 1;
      const { fn, resolve, reject } = this.queue.shift();
      console.log(`[RateLimiter] Token Granted. Remaining queue size: ${this.queue.length}. Available tokens: ${this.tokens.toFixed(2)}`);
      
      fn().then(resolve).catch(reject);
    }
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export const rateLimiter = new RateLimiter(SCHEDULER_CONFIG.MAX_REQUESTS_PER_MINUTE);
