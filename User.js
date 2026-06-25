const db = require('../config/db');

const User = {
    // 1. Email se user ko dhoondna (Login ke waqt kaam aayega)
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
        return rows[0]; // Agar user mila to uska data return karega, nahi to undefined
    },

    // 2. Naya user database me register/insert karna
    create: async (name, email, hashedPassword) => {
        const [result] = await db.execute(
            'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        return result.insertId; // Naye bane user ki unique ID return karega
    }
};

module.exports = User;