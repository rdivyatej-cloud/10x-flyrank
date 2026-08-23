const cron = require('node-cron');
const db = require('../database/db');

// Run every day at midnight to check if we need to generate summaries
const startMonthlySummaryJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running monthly summary job...');
    try {
      // Logic: For each user, check if last month's summary exists. If not, generate it.
      // This is simplified for the capstone project.
      const usersResult = await db.query('SELECT id FROM users');
      
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const monthYear = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;

      for (const user of usersResult.rows) {
        const userId = user.id;

        const existsResult = await db.query(
          'SELECT id FROM monthly_summaries WHERE user_id = $1 AND month_year = $2',
          [userId, monthYear]
        );

        if (existsResult.rows.length === 0) {
          // Calculate summary for last month
          const expensesResult = await db.query(`
            SELECT category, amount 
            FROM expenses 
            WHERE user_id = $1 
            AND EXTRACT(MONTH FROM date) = $2 
            AND EXTRACT(YEAR FROM date) = $3
          `, [userId, lastMonth.getMonth() + 1, lastMonth.getFullYear()]);

          let totalSpending = 0;
          const categoryTotals = {};
          
          expensesResult.rows.forEach(exp => {
            const amt = parseFloat(exp.amount);
            totalSpending += amt;
            if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
            categoryTotals[exp.category] += amt;
          });

          await db.query(`
            INSERT INTO monthly_summaries (user_id, month_year, total_spending, category_totals, num_expenses)
            VALUES ($1, $2, $3, $4, $5)
          `, [userId, monthYear, totalSpending, JSON.stringify(categoryTotals), expensesResult.rows.length]);
          
          console.log(`Generated summary for user ${userId} for ${monthYear}`);
        }
      }
    } catch (error) {
      console.error('Error in monthly summary job:', error);
    }
  });
};

module.exports = startMonthlySummaryJob;
