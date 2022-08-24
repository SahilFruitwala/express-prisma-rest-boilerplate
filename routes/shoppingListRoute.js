const express = require('express')

const { isLoggedIn } = require('../middleware/auth')
const {
  createList,
  getList,
  updateList,
} = require('../controllers/shoppingListController')

const router = express.Router()

router.route('/list').post(isLoggedIn, createList)
router.route('/list').get(isLoggedIn, getList)
router.route('/list/:shoppingListId').patch(isLoggedIn, updateList)

module.exports = router
