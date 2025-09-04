// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProfile, createReport, listReports } = require('../controllers/userController');

// protected
router.get('/profile', auth, getProfile);
router.post('/reports', auth, createReport);   // Create simple report (JSON)
router.get('/my-reports', auth, listReports);     // List reports for logged-in user

module.exports = router;
//backend/