const express = require('express');
const router = express.Router();
const { verifyAndRecordPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Route: Scanner se payment hone ke baad database me entry karne ke liye
router.post('/verify-record', protect, verifyAndRecordPayment);

module.exports = router;