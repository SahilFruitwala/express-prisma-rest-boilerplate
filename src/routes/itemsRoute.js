const express = require('express')

const { isLoggedIn } = require('../middleware/auth')
const {
  addItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemsController')

const router = express.Router()

router.route('/items/add').post(isLoggedIn, addItem)
router.route('/items/:id').patch(isLoggedIn, updateItem)
router.route('/items/:id').delete(isLoggedIn, deleteItem)

module.exports = router
