const jwt = require('jsonwebtoken')
const { SECRET_KEY } = process.env

exports.generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn,
  })
}

exports.verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY)
}
