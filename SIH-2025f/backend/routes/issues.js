const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });
const {
  getAllIssues,
  getUserIssues,
  removeIssueAssignment, // 👈 expects this name
  assignIssueToEmployee,
  classifyReport,
  getDeptIssues,
  updateIssueStatus,
  agentUpdateIssue,
  createIssueWithLocation,
  fetchAddress,
  fetchSentimentalAnalysis,
} = require("../controllers/issuesController");

const {
  getCommentsForIssue,
  createComment,
} = require("../controllers/commentsController");

// Routes
router.get("/", getAllIssues);
router.get("/user/:userId", authMiddleware, getUserIssues);
router.post(
  "/create",
  authMiddleware,
  upload.single("photo"),
  createIssueWithLocation
);
// Fetch single issue by ID
router.get("/dept/:issue_id", authMiddleware, getDeptIssues);

// Fetch manager/HOD issues
router.get("/dept", authMiddleware, getDeptIssues);
router.patch("/update-status/:issueId", authMiddleware, updateIssueStatus);
router.post("/classify-report", authMiddleware, classifyReport);
router.post(
  "/agent-update/:issue_id",
  authMiddleware,
  upload.single("fixedImageFile"),
  agentUpdateIssue
);
//fetch address for frontend
router.post("/fetch-address", fetchAddress);

//fetch summary of sentimental analysis
router.get("/summary/:issueId", authMiddleware, fetchSentimentalAnalysis);

router.post("/assign-issue", authMiddleware, assignIssueToEmployee);
router.post("/deassign", authMiddleware, removeIssueAssignment);

//comment routes
router.get("/comments/:issueId", getCommentsForIssue);
router.post("/comments/:issueId", authMiddleware, createComment);

module.exports = router;
