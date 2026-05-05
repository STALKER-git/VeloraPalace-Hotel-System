const express = require('express');
const { getMe, updateDetails, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', protect, resetPassword);

module.exports = router;
