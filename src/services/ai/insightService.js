const { GoogleGenAI } = require('@google/genai');
const db = require('../../database/db');

const getInsights = async (userId) => {
  try {
    // 1. Fetch user data (This Month)
    const monthlyResult = await db.query(`
      SELECT category, SUM(amount) as total 
      FROM expenses 
      WHERE user_id = $1 
      AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY category
    `, [userId]);

    if (monthlyResult.rows.length === 0) {
      return "You don't have any expenses this month to analyze.";
    }

    let promptData = "Here is my spending data for this month:\n";
    let total = 0;
    monthlyResult.rows.forEach(row => {
        const amt = parseFloat(row.total);
        promptData += `${row.category}: ₹${amt}\n`;
        total += amt;
    });
    promptData += `Total: ₹${total}\n`;

    const prompt = `${promptData}
    Based on this data, provide:
    1. A short spending summary
    2. My highest spending category
    3. Simple observations
    4. 2-3 practical suggestions
    Keep it concise and friendly. Do not provide financial investment advice.`;

    // 2. Call LLM
    let aiResponse = "";
    const provider = process.env.LLM_PROVIDER || 'gemini';
    const highestCategory = monthlyResult.rows.reduce((max, r) => parseFloat(r.total) > parseFloat(max.total) ? r : max, monthlyResult.rows[0]);
    const mockResponse = `${highestCategory.category} is your highest spending category this month, accounting for a significant portion of your total spending.\n\nSuggestions:\n• Consider setting a monthly ${highestCategory.category.toLowerCase()} budget.\n• Track frequent small purchases.\n• Review expenses at the end of each week.`;

    if (provider === 'gemini' && process.env.LLM_API_KEY && process.env.LLM_API_KEY !== 'your_llm_api_key') {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY });
            const response = await ai.models.generateContent({
                model: process.env.LLM_MODEL || 'gemini-1.5-pro',
                contents: prompt,
            });
            aiResponse = response.text;
        } catch (apiError) {
            console.warn("AI API call failed, falling back to mock:", apiError.message);
            aiResponse = mockResponse;
        }
    } else {
        // Mock response if no key or unsupported provider
        aiResponse = mockResponse;
    }

    // 3. Save insight
    await db.query(`
      INSERT INTO ai_insights (user_id, period, summary) 
      VALUES ($1, 'This Month', $2)
    `, [userId, aiResponse]);

    return aiResponse;

  } catch (error) {
    console.error("AI Insight Error:", error);
    throw error;
  }
};

module.exports = {
    getInsights
};
