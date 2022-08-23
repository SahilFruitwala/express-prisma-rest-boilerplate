const express = require('express')

const { isLoggedIn } = require('../middleware/auth')
const { createList, getList } = require('../controllers/shoppingListController')

const router = express.Router()

router.route('/list').post(isLoggedIn, createList)
router.route('/list').get(isLoggedIn, getList)

module.exports = router
