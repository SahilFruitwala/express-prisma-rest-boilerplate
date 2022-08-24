const express = require('express')

const { isLoggedIn } = require('../middleware/auth')
const {
  addItem, updateItem
} = require('../controllers/itemsController')

const router = express.Router()

router.route('/items/add').post(isLoggedIn, addItem)
router.route('/items/:itemId').patch(isLoggedIn, updateItem)
// router.route('/list/:shoppingListId').patch(isLoggedIn, updateList)

module.exports = router
