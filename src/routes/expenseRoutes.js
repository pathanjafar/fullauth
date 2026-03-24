const express = require('express');
const {
    getExpenses,
    addExpense,
    deleteExpense,
    updateBudget
} = require('../controllers/expenseController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router
    .route('/')
    .get(getExpenses)
    .post(addExpense);

router.route('/budget').put(updateBudget);

router.route('/:id').delete(deleteExpense);

module.exports = router;
