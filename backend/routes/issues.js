// routes/issues.js
const express = require("express");
const router = express.Router();
const { getAllIssues, getUserIssues, createIssue } = require("../controllers/issuesController");
const authenticateUser = require("../middleware/authMiddleware");
const checkDuplicateIssue = require("../middleware/checkDuplicateIssue")

// Now only relative paths
router.get("/", getAllIssues);                  // GET /issues
router.get("/user/:userId", getUserIssues);     // GET /issues/user/:userId
router.post("/create", authenticateUser, checkDuplicateIssue, createIssue); // POST /issues/create

module.exports = router;

//.
