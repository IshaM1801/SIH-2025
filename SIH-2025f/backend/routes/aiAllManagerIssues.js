const express = require("express");
const { analyzeAllManagerIssues } = require("./AI-agent/aiAllManagerIssues"); // correct path
const authMiddleware = require("../middleware/authMiddleware"); // import auth middleware

const router = express.Router();

// ✅ Protected route using authMiddleware
router.get("/all-manager-issues", authMiddleware, async (req, res) => {
  try {
    // authMiddleware already verifies token and attaches user to req.user
    // Use the token from req.user if needed
    const token = req.headers.authorization?.split(" ")[1]; 

    const analysis = await analyzeAllManagerIssues(token);
    res.json({ analysis });
  } catch (err) {
    console.error("Error analyzing all manager issues:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;