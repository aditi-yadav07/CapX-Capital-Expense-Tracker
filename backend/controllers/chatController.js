const { GoogleGenAI } = require('@google/genai');
const db = require('../config/db');

// env se API key lekar initialize kiya
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const handleChatAssistant = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body; // User ka sawal frontend se aayega

        if (!message) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // 1. Database se user ka sara Financial Context nikalna
        // A. Total Income & Expenses
        const [totals] = await db.execute(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
             FROM Transactions WHERE user_id = ?`, [userId]
        );

        // B. Category wise kharche
        const [categoryExpenses] = await db.execute(
            `SELECT c.name as category_name, SUM(t.amount) as total_spent
             FROM Transactions t
             JOIN Categories c ON t.category_id = c.id
             WHERE t.user_id = ? AND t.type = 'expense'
             GROUP BY t.category_id`, [userId]
        );

        // C. Set kiye gye Budgets aur unka current status
        const currentMonthYear = new Date().toISOString().slice(0, 7);
        const [budgets] = await db.execute(
            `SELECT c.name as category_name, b.amount as limit_amount
             FROM Budgets b
             JOIN Categories c ON b.category_id = c.id
             WHERE b.user_id = ? AND b.month_year = ?`, [userId, currentMonthYear]
        );

        // D. Recent 10 Transactions ka log stream
        const [recentTx] = await db.execute(
            `SELECT t.type, t.amount, t.description, t.transaction_date, c.name as category_name 
             FROM Transactions t
             JOIN Categories c ON t.category_id = c.id
             WHERE t.user_id = ? 
             ORDER BY t.transaction_date DESC LIMIT 10`, [userId]
        );

        // 2. Data ko ek clean Context string me bundle karna taaki Gemini samajh sake
        const financialContext = {
            net_balance: (totals[0].total_income || 0) - (totals[0].total_expense || 0),
            total_income: totals[0].total_income || 0,
            total_expense: totals[0].total_expense || 0,
            breakdown_by_category: categoryExpenses,
            monthly_budget_limits: budgets,
            recent_transactions_log: recentTx
        };

        // 3. Cyberpunk-themed strict Persona Prompt design karna
        const systemInstruction = `
            You are a Cyberpunk Personal Financial AI Assistant built inside a budget tracker mainframe. 
            Your tone is professional, direct, futuristic, and highly analytical. Do not use overly poetic or flattering words.
            You have complete real-time access to the user's financial matrix.
            
            USER FINANCIAL MATRIX DATA:
            ${JSON.stringify(financialContext, null, 2)}
            
            INSTRUCTIONS:
            - Answer the user's question accurately using ONLY their financial matrix data provided above.
            - If they ask for recommendations or how to reduce expenses, analyze their breakdown_by_category and monthly_budget_limits to give specific, actionable advice.
            - Keep your responses structured with clear spacing or short paragraphs.
            - **DYNAMIC LANGUAGE MATCHING REQUIREMENT:** Detect the language used by the user in their prompt. If the user asks the question in Hinglish, respond entirely in Hinglish. If the user asks in English, respond entirely in English. Always perfectly mirror the user's language choice.
        `;

        // 4. Gemini 2.5 Flash model ko context aur user message ke sath call karna
        // Wapas stable gemini-2.5-flash par standard setup kiya
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: message,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3
            }
        });
        // Response wapas frontend ko bhej dena
        res.json({ reply: response.text });

    } catch (error) {
        console.error('Gemini Mainframe Error:', error);
        res.status(500).json({ message: 'AI Terminal integration failed', error: error.message });
    }
};

module.exports = { handleChatAssistant };