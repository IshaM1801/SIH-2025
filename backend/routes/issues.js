const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require("multer");

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  getAllIssues,
  getUserIssues,
  createIssue,
  getDeptIssues
} = require('../controllers/issuesController');

// Routes
router.get('/', authMiddleware, getAllIssues);
router.get('/user/:userId', authMiddleware, getUserIssues);
router.post('/create', authMiddleware, upload.single("photo"), createIssue);
router.get('/dept', authMiddleware, getDeptIssues);
//
module.exports = router;