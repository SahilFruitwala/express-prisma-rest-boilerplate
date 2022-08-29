import express from 'express'

import isLoggedIn from '../middlewares/auth'
import {
  createList,
  getList,
  updateList,
  deleteList,
} from '../controllers/shoppingListController'

const router = express.Router()

router.route('/list').post(isLoggedIn, createList)
router.route('/list').get(isLoggedIn, getList)
router.route('/list/:id').patch(isLoggedIn, updateList)
router.route('/list/:id').delete(isLoggedIn, deleteList)

export default router
