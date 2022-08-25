const express = require('express')

const { isLoggedIn } = require('../middleware/auth')
const {
  createList,
  getList,
  updateList,
  deleteList,
} = require('../controllers/shoppingListController')

const router = express.Router()

router.route('/list').post(isLoggedIn, createList)
router.route('/list').get(isLoggedIn, getList)
router.route('/list/:shoppingListId').patch(isLoggedIn, updateList)
router.route('/list/:shoppingListId').delete(isLoggedIn, deleteList)

module.exports = router
