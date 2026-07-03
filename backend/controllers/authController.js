const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER / SIGNUP LOGIC
const register = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        const finalName = name || username;

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email pehle se registered hai!' });
        }

        // 2. Password encryption
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create(finalName, email, hashedPassword);

        res.status(201).json({ message: 'User register ho gaya successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server me error hai', error: error.message });
    }
};

// LOGIN LOGIC
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Galat Email ya Password!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Galat Email ya Password!' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { 
                id: user.id, 
                name: user.name || user.username || "User", 
                username: user.name || user.username || "User",
                email: user.email 
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server me error hai', error: error.message });
    }
};

module.exports = { register, login };
