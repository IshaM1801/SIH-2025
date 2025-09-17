// backend/workers/scheduler.js

const cron = require("node-cron");
const { postResolvedIssuesJob } = require("../services/xService");

// Schedule the job to run every 5 minutes
cron.schedule("*/1 * * * *", async () => {
  await postResolvedIssuesJob();
});

console.log(
  "Worker process started. X posting job scheduled to run every 5 minutes."
);
