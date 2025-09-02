// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ------------------ USER AUTH ROUTES ------------------

// Register (user signup with email verification link)
router.post("/register", authController.register);

// Login (user or employee)
router.post("/login", authController.login);

// Verify token (check auth token)
router.get("/verify", authController.verifyToken);

// Password reset request (send reset email)
router.post("/reset-password-request", authController.requestPasswordReset);

// Password update (after email reset link)
router.post("/reset-password", authController.updatePassword);

module.exports = router;