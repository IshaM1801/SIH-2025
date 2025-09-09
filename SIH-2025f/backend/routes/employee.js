// routes/employeeRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // JWT auth middleware
const multer = require("multer");

// Multer setup if you need file uploads for employee (optional)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  getTeamEmployees,
  getEmployeeById,
 
} = require("../controllers/employeeController");

// Routes

// 1️⃣ Fetch all employees under the logged-in manager's team
router.get("/team", authMiddleware, getTeamEmployees);

// 2️⃣ Fetch single employee by ID
router.get("/:empId", authMiddleware, getEmployeeById);


module.exports = router;