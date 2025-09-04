// routes/issues.js
const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
//.
const {
  getAllIssues,
  getUserIssues,
  createIssue,
  getDeptIssues    // new
} = require('../controllers/issuesController');

// Routes
router.get('/', authMiddleware, getAllIssues);
router.get('/user/:userId', authMiddleware, getUserIssues);
router.post('/create', authMiddleware, createIssue);
router.get('/dept', authMiddleware, getDeptIssues);  // new

module.exports = router;

//.
