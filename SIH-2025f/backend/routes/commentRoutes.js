// routes/apiRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // Adjust path if needed
const upload = require("../middleware/multerMiddleware"); // Adjust path to your multer config

const commentController = require("../controllers/commentsController");
const uploadController = require("../controllers/uploadController");

// --- Comment Routes ---
// These match the URLs used in your frontend
router.get(
  "/issues/comments/:issueId",
  authMiddleware,
  commentController.getCommentsForIssue
);
router.post(
  "/issues/comments/:issueId",
  authMiddleware,
  commentController.createComment
);
router.put(
  "/issues/comments/:commentId",
  authMiddleware,
  commentController.updateComment
);
router.delete(
  "/issues/comments/:commentId",
  authMiddleware,
  commentController.deleteComment
);

// --- Image Upload Route ---
router.post(
  "/upload/comment-image",
  authMiddleware,
  upload.single("image"),
  uploadController.uploadCommentImage
);

// --- Upvote/Like Routes ---
// You can add these here later if you implement the upvote logic

module.exports = router;
