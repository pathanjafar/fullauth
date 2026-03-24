const Expense = require('../models/Expense');
const User = require('../models/User');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
        
        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses,
            budget: req.user.budget
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add expense
// @route   POST /api/expenses
// @access  Private
exports.addExpense = async (req, res) => {
    try {
        req.body.user = req.user.id;

        const expense = await Expense.create(req.body);

        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        // Make sure user owns expense
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update budget
// @route   PUT /api/expenses/budget
// @access  Private
exports.updateBudget = async (req, res) => {
    try {
        const { budget } = req.body;

        const user = await User.findByIdAndUpdate(req.user.id, { budget }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            budget: user.budget
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
