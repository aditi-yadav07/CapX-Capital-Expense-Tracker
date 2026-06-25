const express = require('express');
const { generateAiInsights } = require('../controllers/insightController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET endpoint jo protected hai
router.get('/', protect, generateAiInsights); // Route: /api/insights

module.exports = router;