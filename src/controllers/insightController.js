const { getInsights } = require('../services/ai/insightService');

const generateInsights = async (req, res) => {
  try {
    const insights = await getInsights(req.user.id);
    res.json({ success: true, insights });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { message: 'Failed to generate AI insights' } });
  }
};

module.exports = {
  generateInsights
};
