const router = require('express').Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

// Get all expenses
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.userId });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create expense
router.post('/', auth, async (req, res) => {
    try {
        const expense = new Expense({
            ...req.body,
            user: req.user.userId
        });
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
