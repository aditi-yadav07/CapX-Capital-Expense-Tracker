const db = require('../config/db');

const Insight = {
    // Isme hum complex calculations database queries se hi nikalenge
    getFinancialSummary: async (userId) => {
        // 1. Total Income aur Expense nikalna
        const [totals] = await db.execute(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
             FROM Transactions WHERE user_id = ?`,
            [userId]
        );

        // 2. Sabse zyada kharch kis category me hua, wo nikalna
        const [topExpenseCategory] = await db.execute(
            `SELECT c.name as category_name, SUM(t.amount) as total_spent
             FROM Transactions t
             JOIN Categories c ON t.category_id = c.id
             WHERE t.user_id = ? AND t.type = 'expense'
             GROUP BY t.category_id
             ORDER BY total_spent DESC
             LIMIT 1`,
            [userId]
        );

        return {
            totals: totals[0] || { total_income: 0, total_expense: 0 },
            topCategory: topExpenseCategory[0] || null
        };
    }
};

module.exports = Insight;