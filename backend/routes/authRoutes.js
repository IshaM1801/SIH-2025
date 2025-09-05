const express = require("express");
const router = express.Router();
const { completeProfile, register, login, requestPasswordReset, updatePassword } = require("../controllers/authController");
//
// your routes
router.post("/complete-profile", completeProfile);
router.post("/register", register);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/update-password", updatePassword);

module.exports = router;