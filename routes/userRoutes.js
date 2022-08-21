const express = require('express')

const {
  signIn,
  signUp,
  signOut,
  changePassword,
  resetPassword,
  updateUser,
  getUser,
} = require('../controllers/userController')

const router = express.Router()

router.route('/user').get(getUser)
router.route('/signin').post(signIn)
router.route('/signup').post(signUp)
router.route('/signout').get(signOut)
router.route('/password/resetpassword').patch(resetPassword)
router.route('/password/changepassword').patch(changePassword)
router.route('/user/update').patch(updateUser)

module.exports = router
