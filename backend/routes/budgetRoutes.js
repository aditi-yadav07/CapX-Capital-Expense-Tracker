const express = require('express');
const { setBudget, getBudgetsStatus } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware'); // Security middleware

const router = express.Router();

// Dono routes par authentication check lagaya
router.post('/', protect, setBudget);        // POST: /api/budgets (Set/Update budget)
router.delete('/:id', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const budgetId = req.params.id;

        await db.execute('DELETE FROM Budgets WHERE id = ? AND user_id = ?', [budgetId, userId]);
        res.json({ message: 'Budget limit erased successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to erase budget parameter.' });
    }
});

// 2. EDIT / UPDATE BUDGET LIMIT
router.put('/:id', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const budgetId = req.params.id;
        const { amount } = req.body;

        await db.execute('UPDATE Budgets SET amount = ? WHERE id = ? AND user_id = ?', [amount, budgetId, userId]);
        res.json({ message: 'Budget limit modified successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to modify budget parameter.' });
    }
});
router.get('/status', protect, getBudgetsStatus); // GET: /api/budgets/status (Check limit vs expense)

module.exports = router;