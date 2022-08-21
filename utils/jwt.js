const jwt = require('jsonwebtoken')
const { SECRET_KEY, JWT_EXPIRY } = process.env

exports.generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: JWT_EXPIRY,
  })
}

exports.verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY)
}
