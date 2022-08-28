const express = require('express')

const { isLoggedIn } = require('../middlewares/auth')
const {
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenses,
  getSummary,
} = require('../controllers/expensesController')

const router = express.Router()

router.route('/expenses').get(isLoggedIn, getExpenses)
router.route('/expenses/add').post(isLoggedIn, addExpense)
router.route('/expenses/:id').patch(isLoggedIn, updateExpense)
router.route('/expenses/:id').delete(isLoggedIn, deleteExpense)
router.route('/expenses/summary').get(isLoggedIn, getSummary)

module.exports = router
