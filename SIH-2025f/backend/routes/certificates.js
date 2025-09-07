// backend/routes/certificates.js
const express = require("express");
const router = express.Router();
const path = require("path");
const { generateCertificate } = require("../utils/generateCertificate");
const axios = require("axios");
const { supabase } = require("../controllers/authController");
const AdmZip = require("adm-zip");

// Middleware for auth
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("===== Certificate Request Start =====");

    const userId = req.user.id;
    console.log("Logged-in user ID:", userId);

    // Fetch user name from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('auth_id', userId)
      .single();

    const userName = profileError || !profileData ? "User" : profileData.name;
    console.log("User name from profiles table:", userName);

    // Fetch all issues of this user
    const { data: userIssues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .eq('created_by', userId);

    if (issuesError) {
      console.error("Error fetching issues:", issuesError);
      return res.status(500).json({ error: "Failed to fetch issues" });
    }

    console.log("Fetched user issues:", userIssues);

    if (!userIssues || userIssues.length === 0) {
      console.log("No issues found for this user");
      return res.status(404).json({ error: "No issues found" });
    }

    // Generate certificates for all issues
  // Filter only resolved issues
const resolvedIssues = userIssues.filter(
    (issue) => issue.status?.toLowerCase() === "resolved"
  );
  
  if (resolvedIssues.length === 0) {
    console.log("No resolved issues found for certificate generation");
    return res.status(404).json({ error: "No resolved issues found" });
  }
  
  const certificatePaths = [];
  for (const issue of resolvedIssues) {
    try {
      const filePath = await generateCertificate({
        userName,
        issueTitle: issue.issue_title,
        location: issue.address_component || "Location not available",
        resolutionDate: issue.resolvedDate || new Date().toISOString().split("T")[0],
      });
      console.log("Generated certificate:", filePath);
      certificatePaths.push(filePath);
    } catch (certErr) {
      console.error(
        "Certificate generation failed for issue:",
        issue.issue_title,
        certErr
      );
    }
  }
  
  if (certificatePaths.length === 0) {
    console.log("No certificates generated successfully");
    return res.status(500).json({ error: "Failed to generate any certificates" });
  }
    // Create ZIP
    const zip = new AdmZip();
    certificatePaths.forEach((file) => {
      zip.addLocalFile(path.resolve(file));
      console.log("Added to ZIP:", file);
    });
    const zipBuffer = zip.toBuffer();

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=certificates_${userId}.zip`);
    console.log("Sending ZIP file");
    res.send(zipBuffer);

    console.log("===== Certificate Request End =====");
  } catch (err) {
    console.error("Certificate generation error:", err);
    res.status(500).json({ error: "Failed to generate certificates" });
  }
});

// Test single certificate route
router.get("/test", authMiddleware, async (req, res) => {
  try {
    const filePath = await generateCertificate({
      userName: "Test User",
      issueTitle: "Test Issue",
      location: "Test Location",
      resolutionDate: "2025-09-07",
    });
    res.sendFile(filePath);
  } catch (err) {
    console.error("Test certificate error:", err);
    res.status(500).json({ error: "Test certificate generation failed" });
  }
});

module.exports = router;