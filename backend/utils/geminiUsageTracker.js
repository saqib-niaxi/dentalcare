/**
 * Simple Gemini API Usage Tracker
 * Helps monitor free tier limits:
 * - 15 requests per minute
 * - 1,500 requests per day
 */

class GeminiUsageTracker {
  constructor() {
    this.minuteRequests = [];
    this.dailyRequests = [];
  }

  // Check if request is within rate limits
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    // Clean old requests
    this.minuteRequests = this.minuteRequests.filter(time => time > oneMinuteAgo);
    this.dailyRequests = this.dailyRequests.filter(time => time > oneDayAgo);

    // Check limits
    const withinMinuteLimit = this.minuteRequests.length < 15;
    const withinDailyLimit = this.dailyRequests.length < 1500;

    return withinMinuteLimit && withinDailyLimit;
  }

  // Record a request
  recordRequest() {
    const now = Date.now();
    this.minuteRequests.push(now);
    this.dailyRequests.push(now);
  }

  // Get current usage stats
  getStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    // Clean old requests
    this.minuteRequests = this.minuteRequests.filter(time => time > oneMinuteAgo);
    this.dailyRequests = this.dailyRequests.filter(time => time > oneDayAgo);

    return {
      requestsThisMinute: this.minuteRequests.length,
      requestsToday: this.dailyRequests.length,
      minuteLimit: 15,
      dailyLimit: 1500,
      minuteRemaining: 15 - this.minuteRequests.length,
      dailyRemaining: 1500 - this.dailyRequests.length
    };
  }
}

// Singleton instance
const tracker = new GeminiUsageTracker();

module.exports = tracker;
