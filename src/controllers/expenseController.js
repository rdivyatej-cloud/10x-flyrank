const db = require('../database/db');

const addExpense = async (req, res) => {
  const { amount, category, description, date } = req.body;
  if (!amount || !category || !date) {
    return res.status(400).json({ success: false, error: { message: 'Amount, category, and date are required' } });
  }

  try {
    const result = await db.query(
      'INSERT INTO expenses (user_id, amount, category, description, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, amount, category, description, date]
    );
    res.status(201).json({ success: true, expense: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

const getExpenses = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
    res.json({ success: true, expenses: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

const getExpenseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM expenses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Expense not found' } });
    }
    res.json({ success: true, expense: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, category, description, date } = req.body;
  
  if (!amount || !category || !date) {
    return res.status(400).json({ success: false, error: { message: 'Amount, category, and date are required' } });
  }

  try {
    const result = await db.query(
      'UPDATE expenses SET amount = $1, category = $2, description = $3, date = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [amount, category, description, date, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Expense not found or unauthorized' } });
    }
    res.json({ success: true, expense: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Expense not found or unauthorized' } });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};
