const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  completeProfile,
  register,
  login,
  requestPasswordReset,
  updatePassword,
  verifyEmail
} = require("../controllers/authController");

// Routes

// ✅ Protected route: user must be logged in
router.post("/complete-profile", authMiddleware, completeProfile);

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/update-password", updatePassword);
router.post("/verify", verifyEmail);

module.exports = router;