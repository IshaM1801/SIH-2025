// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ------------------ AUTH ROUTES ------------------

// Register (user or employee)
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Verify token
router.get("/verify", authController.verifyToken);

// Password reset request
router.post("/reset-password-request", authController.requestPasswordReset);

// Update password (after reset link)
router.post("/reset-password", authController.updatePassword);

module.exports = router;