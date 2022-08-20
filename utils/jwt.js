const jwt = require('jsonwebtoken')
const { SECRET_KEY } = process.env

exports.generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: '2h',
  })
}

exports.verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY)
}
