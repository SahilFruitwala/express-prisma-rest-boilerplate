const jwt = require('jsonwebtoken')

const { SECRET_KEY } = process.env
// const User = require('../model/user')

const auth = (req, res, next) => {
  // use only one of these 3
  const token =
    req.header('Authorization')?.replace('Bearer ', '') ||
    req.cookies.token ||
    req.body.token

  if (!token) {
    return res.status(403).json({ msg: 'Authentication error!' })
  }

  try {
    const decodedData = jwt.verify(token, SECRET_KEY)
    req.user = decodedData
  } catch (error) {
    return res.status(500).json({ msg: 'Something went wrong!' })
  }

  return next()
}

module.exports = auth
