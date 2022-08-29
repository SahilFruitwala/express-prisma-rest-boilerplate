import jwt from 'jsonwebtoken'
const { SECRET_KEY, JWT_EXPIRY } = process.env

export const generateToken = (payload: string) => {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: JWT_EXPIRY,
  })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY)
}
