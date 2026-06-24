const db = require('../config/db');

const Budget = {
    // 1. Kisi specific user ke saare budgets limits nikalna
    findByUserId: async (userId) => {
        const [rows] = await db.execute(
            `SELECT b.*, c.name AS category_name 
             FROM Budgets b
             JOIN Categories c ON b.category_id = c.id 
             WHERE b.user_id = ?`, 
            [userId]
        );
        return rows;
    },

    // 2. Naya budget set karna ya purane ko update karna (Upsert logic)
    upsert: async (userId, categoryId, amount, monthYear) => {
        // Pehle check karenge ki us mahine ke liye us category ka budget pehle se hai ya nahi
        const [existing] = await db.execute(
            'SELECT id FROM Budgets WHERE user_id = ? AND category_id = ? AND month_year = ?',
            [userId, categoryId, monthYear]
        );

        if (existing.length > 0) {
            // Agar pehle se hai to amount update kar do
            await db.execute(
                'UPDATE Budgets SET amount = ? WHERE id = ?',
                [amount, existing[0].id]
            );
            return existing[0].id;
        } else {
            // Nahi to naya insert karo
            const [result] = await db.execute(
                'INSERT INTO Budgets (user_id, category_id, amount, month_year) VALUES (?, ?, ?, ?)',
                [userId, categoryId, amount, monthYear]
            );
            return result.insertId;
        }
    }
};

module.exports = Budget;