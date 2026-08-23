const express = require('express');
const { addExpense, getExpenses, getExpenseById, updateExpense, deleteExpense } = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Apply auth middleware to all expense routes
router.use(authMiddleware);

router.post('/', addExpense);
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
