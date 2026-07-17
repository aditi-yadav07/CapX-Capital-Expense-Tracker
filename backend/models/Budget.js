const db = require('../config/db');

const Budget = {
    // 1. Kisi specific user ke saare budgets limits nikalna
    findByUserId: async (userId) => {
        const [rows] = await db.execute(
            `SELECT b.*, c.name AS category_name 
             FROM budgets b
             JOIN categories c ON b.category_id = c.id 
             WHERE b.user_id = ?`, 
            [userId]
        );
        return rows;
    },

    
    upsert: async (userId, categoryId, amount, monthYear) => {
      
        const [existing] = await db.execute(
            'SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND month_year = ?',
            [userId, categoryId, monthYear]
        );

        if (existing.length > 0) {
            
            await db.execute(
                'UPDATE budgets SET amount = ? WHERE id = ?',
                [amount, existing[0].id]
            );
            return existing[0].id;
        } else {
            // Nahi to naya insert karo
            const [result] = await db.execute(
                'INSERT INTO budgets (user_id, category_id, amount, month_year) VALUES (?, ?, ?, ?)',
                [userId, categoryId, amount, monthYear]
            );
            return result.insertId;
        }
    }
};

module.exports = Budget;
