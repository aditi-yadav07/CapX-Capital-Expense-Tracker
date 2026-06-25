const express = require('express');
const { handleChatAssistant } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected POST route jahan frontend se message aayega
router.post('/message', protect, handleChatAssistant); // Route: /api/chat/message

module.exports = router;