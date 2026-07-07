const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db'); // 👈 NEW

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const insightRoutes = require('./routes/insightRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/chat', chatRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('Cyberpunk Budget Tracker Backend Chal Raha Hai! 🚀');
});

// ================= DEBUG ROUTE =================

app.get("/db-test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS ok");

        res.json({
            success: true,
            data: rows
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            code: err.code,
            errno: err.errno,
            message: err.message
        });
    }
});

// ===============================================

const PORT = process.env.PORT || 5000;

// GLOBAL ERROR LOGGER MIDDLEWARE
app.use((err, req, res, next) => {
    console.error("💥 CRITICAL GLOBAL SERVER EXCEPTION LOGGED:");
    console.error("Path:", req.path);
    console.error("Error Detail:", err);

    res.status(500).json({
        message: "Global Server Breakdown",
        error: err.message
    });
});

module.exports = app;
