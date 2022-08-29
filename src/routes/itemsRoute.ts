import express from 'express'

import isLoggedIn from '../middlewares/auth'
import {
  addItem,
  updateItem,
  deleteItem,
} from '../controllers/itemsController'

const router = express.Router()

router.route('/items/add').post(isLoggedIn, addItem)
router.route('/items/:id').patch(isLoggedIn, updateItem)
router.route('/items/:id').delete(isLoggedIn, deleteItem)

export default router
