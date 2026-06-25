const db = require('../config/db');

const Transaction = {
    // 1. Kisi specific user ke saare transactions nikalna
    findByUserId: async (userId) => {
        const [rows] = await db.execute(
            `SELECT t.*, c.name AS category_name 
             FROM Transactions t 
             JOIN Categories c ON t.category_id = c.id 
             WHERE t.user_id = ? 
             ORDER BY t.transaction_date DESC`, 
            [userId]
        );
        return rows;
    },

    // 2. Naya transaction database me add karna
    create: async (userId, categoryId, type, amount, description, date) => {
        const [result] = await db.execute(
            `INSERT INTO Transactions (user_id, category_id, type, amount, description, transaction_date) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, categoryId, type, amount, description, date]
        );
        return result.insertId;
    },

    // 3. Transaction delete karna
    delete: async (transactionId, userId) => {
        const [result] = await db.execute(
            'DELETE FROM Transactions WHERE id = ? AND user_id = ?',
            [transactionId, userId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Transaction;