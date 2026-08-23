const db = require('../database/db');

const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total spending
    const totalResult = await db.query('SELECT SUM(amount) as total FROM expenses WHERE user_id = $1', [userId]);
    const totalSpending = totalResult.rows[0].total ? parseFloat(totalResult.rows[0].total) : 0;

    // Monthly spending (current month)
    const monthlyResult = await db.query(`
      SELECT SUM(amount) as total 
      FROM expenses 
      WHERE user_id = $1 
      AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `, [userId]);
    const monthlySpending = monthlyResult.rows[0].total ? parseFloat(monthlyResult.rows[0].total) : 0;

    // Number of expenses
    const countResult = await db.query('SELECT COUNT(*) as count FROM expenses WHERE user_id = $1', [userId]);
    const numExpenses = parseInt(countResult.rows[0].count, 10);

    // Category breakdown
    const categoryResult = await db.query(`
      SELECT category, SUM(amount) as total 
      FROM expenses 
      WHERE user_id = $1 
      GROUP BY category 
      ORDER BY total DESC
    `, [userId]);
    
    const categoryBreakdown = {};
    categoryResult.rows.forEach(row => {
      categoryBreakdown[row.category] = parseFloat(row.total);
    });

    const topCategory = categoryResult.rows.length > 0 ? categoryResult.rows[0].category : 'N/A';

    res.json({
      success: true,
      summary: {
        totalSpending,
        monthlySpending,
        numExpenses,
        topCategory,
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

module.exports = {
  getSummary
};
