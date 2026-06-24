const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Register aur Login ke liye endpoints design kiye
router.post('/register', register);
router.post('/login', login);

module.exports = router;