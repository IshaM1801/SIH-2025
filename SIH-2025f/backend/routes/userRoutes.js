// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProfile, createReport, listReports, getProfileDetails, updateProfile } = require('../controllers/userController');
//.
// protected
router.get('/profile', auth, getProfile);
router.post('/reports', auth, createReport);   // Create simple report (JSON)
router.get('/my-reports', auth, listReports);     // List reports for logged-in user
router.get('/profile-details/:userId', auth, getProfileDetails); // ✅ Add new routes
router.patch('/update-profile', auth, updateProfile);
router.post('/create-report', auth, createReport);

module.exports = router;
//backend/