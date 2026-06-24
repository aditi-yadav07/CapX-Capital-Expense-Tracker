const Insight = require('../models/Insight');

const generateAiInsights = async (req, res) => {
    try {
        const userId = req.user.id;

        // Model se financial summary data lekar aao
        const summary = await Insight.getFinancialSummary(userId);
        
        const totalIncome = parseFloat(summary.totals.total_income) || 0;
        const totalExpense = parseFloat(summary.totals.total_expense) || 0;
        const topCategory = summary.topCategory;

        let insights = [];

        // Rule 1: Agar koi data hi nahi hai
        if (totalIncome === 0 && totalExpense === 0) {
            insights.push("Cyber System Booted. Abhi koi transaction data nahi mila. Apne insights generate karne ke liye income ya expense add karein.");
        } else {
            // Rule 2: Expense vs Income Check
            if (totalExpense > totalIncome) {
                insights.push("⚠️ ALERT: Aapka expense aapki total income se zyada ho chuka hai! System critical status par hai, kharche turant kam karein.");
            } else if (totalExpense > totalIncome * 0.8) {
                insights.push("⚠️ WARNING: Aap apni income ka 80% se zyada kharch kar chuke hain. Savings target hatne ki kagar par hai.");
            } else {
                insights.push("✅ SYSTEM SAFE: Aapka expense control me hai. Aap apni income ke safe zone me chal rahe hain.");
            }

            // Rule 3: Top Spending Category Check
            if (topCategory) {
                insights.push(`📊 SPENDING TRAFFIC: Sabse zyada kharcha [${topCategory.category_name}] category me hua hai (₹${topCategory.total_spent}). Is section par thoda dhyan dein.`);
            }

            // Rule 4: General Smart Tip based on ratio
            const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
            if (savingsRate > 30) {
                insights.push(`🚀 CYBER REWARD: Kamaal hai! Aapki savings rate ${savingsRate.toFixed(1)}% hai. Is surplus amount ko invest karne ka sochein.`);
            }
        }

        res.json({
            totalIncome,
            totalExpense,
            insights
        });

    } catch (error) {
        res.status(500).json({ message: 'AI Insight generation failed', error: error.message });
    }
};

module.exports = { generateAiInsights };