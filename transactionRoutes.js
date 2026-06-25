const express = require('express');
const { 
    addTransaction, 
    getTransactions, 
    getCategories, 
    deleteTransaction 
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware'); // Auth check karne ke liye

const router = express.Router();

// Saare routes secure hain, isliye sabme 'protect' lagaya hai
router.post('/', protect, addTransaction);       // POST: /api/transactions
router.get('/', protect, getTransactions);      // GET: /api/transactions
router.get('/categories', protect, getCategories); // GET: /api/transactions/categories
router.delete('/:id', protect, deleteTransaction); // DELETE: /api/transactions/:id

module.exports = router;