// backend/workers/analyticsScheduler.js

const cron = require("node-cron");
const { runPostAnalyticsJob } = require("../services/analyticsService");

// Schedule the job to run every hour (or every 10 minutes for testing: */10 * * * *)
cron.schedule("* * * * *", async () => {
  await runPostAnalyticsJob();
});

console.log(
  "Analytics Worker started. Post analysis scheduled to run every minute."
);
