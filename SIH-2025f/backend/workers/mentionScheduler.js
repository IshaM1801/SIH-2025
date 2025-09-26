// backend/workers/mentionScheduler.js

const cron = require("node-cron");
const {
  runMentionMonitoringJob,
} = require("../services/mentionMonitoringService");

// Schedule the job to run every 2 minutes
cron.schedule("*/2 * * * *", async () => {
  await runMentionMonitoringJob();
});

console.log("Mentions Worker started. Listening for mentions every 2 minutes.");
// To run this worker, use: node backend/workers/mentionScheduler.js
