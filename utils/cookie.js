const { generateToken } = require('./jwt')
const { COOKIE_EXPIRY_DAY } = process.env

const OPTIONS = {
  expires: new Date(Date.now() + +COOKIE_EXPIRY_DAY * 24 * 60 * 60 * 1000),
  httpOnly: true,
}

module.exports = (user, res) => {
  const token = generateToken({ user_id: user.id, email: user.email })
  user.password = undefined

  res.status(200).cookie('token', token, OPTIONS).json({
    msg: 'Successful login!',
    token,
    user,
  })
}
