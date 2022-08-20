const { generateToken } = require('./jwt')

const OPTIONS = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
}

exports.generateCookie = (user, res) => {
  const token = generateToken({ user_id: user._id, email: user.email })
  user.password = undefined

  res.status(200).cookie('token', token, OPTIONS).json({
    msg: 'Successful login!',
    token,
    user,
  })
}
