const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// 1. Naya Transaction Add Karna
const addTransaction = async (req, res) => {
    try {
        const { category_id, type, amount, description, transaction_date } = req.body;
        const userId = req.user.id; // Middleware se mila logged-in user ka ID

        const transactionId = await Transaction.create(
            userId, category_id, type, amount, description, transaction_date
        );

        res.status(201).json({ message: 'Transaction add ho gaya!', transactionId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 2. Logged-in User ke Saare Transactions Get Karna
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.findByUserId(userId);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 3. Saari Categories Get Karna (Dropdown ke liye)
const getCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 4. Transaction Delete Karna
const deleteTransaction = async (req, res) => {
    try {
        const transactionId = req.params.id;
        const userId = req.user.id;

        const deleted = await Transaction.delete(transactionId, userId);
        if (!deleted) {
            return res.status(404).json({ message: 'Transaction nahi mila ya unauthorized!' });
        }

        res.json({ message: 'Transaction delete ho gaya successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { addTransaction, getTransactions, getCategories, deleteTransaction };