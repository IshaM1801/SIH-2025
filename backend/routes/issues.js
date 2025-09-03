const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // updated

const {//.
  getAllIssues,
  getUserIssues,
  createIssue
} = require('../controllers/issuesController');

// Routes
router.get('/', authMiddleware, getAllIssues);
router.get('/user/:userId', authMiddleware, getUserIssues);
router.post('/', authMiddleware, createIssue);

module.exports = router;