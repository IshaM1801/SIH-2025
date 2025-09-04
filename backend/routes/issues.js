// routes/issues.js
const express = require("express");
const router = express.Router();
<<<<<<< Updated upstream
const { getAllIssues, getUserIssues, createIssue } = require("../controllers/issuesController");
const authenticateUser = require("../middleware/authMiddleware");

// Now only relative paths
router.get("/", getAllIssues);                  // GET /issues
router.get("/user/:userId", getUserIssues);     // GET /issues/user/:userId
router.post("/create", authenticateUser, createIssue); // POST /issues/create

module.exports = router;
=======
const authMiddleware = require('../middleware/authMiddleware');

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
>>>>>>> Stashed changes
