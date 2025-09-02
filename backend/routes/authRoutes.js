// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Register (with email verification)
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Verify token
router.get("/verify", authController.verifyToken);

module.exports = router;
// Password reset request
router.post("/reset-password-request", authController.requestPasswordReset);

// Password update
router.post("/reset-password", authController.updatePassword);