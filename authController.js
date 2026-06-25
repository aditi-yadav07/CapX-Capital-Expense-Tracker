const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER / SIGNUP LOGIC
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check karo ki email pehle se register to nahi hai
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email pehle se registered hai!' });
        }

        // 2. Password ko safe rakhne ke liye encrypt (hash) karo
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Database me naya user save karo
        await User.create(username, email, hashedPassword);

        res.status(201).json({ message: 'User register ho gaya successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server me error hai', error: error.message });
    }
};

// LOGIN LOGIC
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. User ko email se dhoondo
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Galat Email ya Password!' });
        }

        // 2. Check karo ki password sahi hai ya nahi
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Galat Email ya Password!' });
        }

        // 3. Ek digital pass (JWT Token) banao jo browser me safe rahega login identity ke liye
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server me error hai', error: error.message });
    }
};

module.exports = { register, login };