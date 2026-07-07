const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes'); // Auth routes 
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

const dns = require("dns");

app.get("/debug", (req, res) => {
  dns.lookup(process.env.DB_HOST, (err, address) => {
    res.json({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dnsError: err ? err.message : null,
      address,
    });
  });
});

const PORT = process.env.PORT || 5000;

// GLOBAL ERROR LOGGER MIDDLEWARE
app.use((err, req, res, next) => {
    console.error("💥 CRITICAL GLOBAL SERVER EXCEPTION LOGGED:");
    console.error("Path:", req.path);
    console.error("Error Detail:", err);
    res.status(500).json({ message: "Global Server Breakdown", error: err.message });
});


module.exports = app;
