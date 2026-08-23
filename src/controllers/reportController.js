const PDFDocument = require('pdfkit');
const db = require('../database/db');

const generateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await db.query('SELECT name FROM users WHERE id = $1', [userId]);
    const userName = userResult.rows[0].name;

    const expensesResult = await db.query('SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC', [userId]);
    const expenses = expensesResult.rows;

    let totalSpending = 0;
    const categoryBreakdown = {};

    expenses.forEach(exp => {
      const amt = parseFloat(exp.amount);
      totalSpending += amt;
      if (!categoryBreakdown[exp.category]) categoryBreakdown[exp.category] = 0;
      categoryBreakdown[exp.category] += amt;
    });

    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe its output to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Expense_Report.pdf');
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('SMART EXPENSE TRACKER', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).text(`User Name: ${userName}`);
    doc.text(`Report Generated Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Report Period: All Time`);
    doc.moveDown();

    // Summary
    doc.fontSize(16).text('Summary');
    doc.fontSize(12).text(`Total Spending: Rs. ${totalSpending.toFixed(2)}`);
    doc.text(`Number of Expenses: ${expenses.length}`);
    doc.moveDown();

    // Category Breakdown
    doc.fontSize(16).text('Category Breakdown');
    for (const [cat, amt] of Object.entries(categoryBreakdown)) {
      doc.fontSize(12).text(`${cat}: Rs. ${amt.toFixed(2)}`);
    }
    doc.moveDown();

    // Expense List
    doc.fontSize(16).text('Expense List');
    doc.moveDown(0.5);

    expenses.forEach(exp => {
      const date = new Date(exp.date).toLocaleDateString();
      doc.fontSize(10).text(`${date} | ${exp.category} | ${exp.description || 'N/A'} | Rs. ${exp.amount}`);
    });

    // Finalize the PDF and end the stream
    doc.end();

  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: { message: 'Failed to generate report' } });
    }
  }
};

module.exports = {
  generateReport
};
