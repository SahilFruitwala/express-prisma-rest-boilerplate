const express = require('express')

const { isLoggedIn } = require('../middleware/auth')
const {
  addItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemsController')

const router = express.Router()

router.route('/items/add').post(isLoggedIn, addItem)
router.route('/items/:itemId').patch(isLoggedIn, updateItem)
router.route('/items/:itemId').delete(isLoggedIn, deleteItem)

module.exports = router
