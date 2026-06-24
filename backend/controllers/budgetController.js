const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// 1. Budget Set ya Update Karna
const setBudget = async (req, res) => {
    try {
        const { category_id, amount, month_year } = req.body; // month_year format: '2026-06'
        const userId = req.user.id;

        const budgetId = await Budget.upsert(userId, category_id, amount, month_year);
        res.status(200).json({ message: 'Budget set ho gaya successfully!', budgetId });
    } catch (error) {
        console.error("Backend Budget Error Detail:", error);

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 2. User ke Saare Budgets aur unka Current Expense status nikalna
const getBudgetsStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // User ke set kiye huye saare budgets lao
        const budgets = await Budget.findByUserId(userId);
        
        // User ke saare transactions lao taaki hum total expense calculate kar sakein
        const transactions = await Transaction.findByUserId(userId);

        // Har budget ke liye calculate karo ki kitna kharch ho chuka hai
        const status = budgets.map(budget => {
            const totalSpent = transactions
                .filter(t => t.type === 'expense' && t.category_id === budget.category_id)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            return {
                id: budget.id,
                category_name: budget.category_name,
                category_id: budget.category_id,
                limit_amount: budget.amount,
                total_spent: totalSpent,
                is_exceeded: totalSpent > budget.amount,
                month_year: budget.month_year
            };
        });

        res.json(status);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { setBudget, getBudgetsStatus };