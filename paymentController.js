const db = require('../config/db');

exports.verifyAndRecordPayment = async (req, res) => {
    try {
        const userId = req.user.id; // Token se user id extract hui
        let { amount, description, category_id, receiver_identity } = req.body;

        const transactionDate = new Date().toISOString().slice(0, 10);

        // AUTO-FALLBACK: Agar user ne koi category nahi chuni, toh default entry '1' set ho jayegi
        if (!category_id) {
            category_id = 1; 
        }

        // Transactions table me entry insert karne ki SQL Query
        await db.execute(
            `INSERT INTO Transactions (user_id, category_id, type, amount, description, transaction_date) 
             VALUES (?, ?, 'expense', ?, ?, ?)`,
            [userId, category_id, amount, description, transactionDate]
        );

        res.status(200).json({ success: true, message: "Transaction auto-logged successfully!" });
    } catch (error) {
        console.error("🚨 BACKEND LEDGER SYNC ERROR:", error);
        res.status(500).json({ message: "Failed to record transaction", error: error.message });
    }
};