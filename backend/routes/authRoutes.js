const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.get("/verify-email", authController.verifyEmail); // new verification route
router.post("/login", authController.login);
router.get("/verify-token", authController.verifyToken);
router.post("/reset-password-request", authController.requestPasswordReset);
router.post("/reset-password", authController.updatePassword);

module.exports = router;