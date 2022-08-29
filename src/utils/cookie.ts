import { Response } from 'express'
const { generateToken } = require('./jwt')
const { COOKIE_EXPIRY_DAY } = process.env

const OPTIONS = {
  expires: new Date(
    Date.now() + +(COOKIE_EXPIRY_DAY || '7') * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
}

export const generateAndSendCookie = (user: any, res: Response) => {
  const token = generateToken({ user_id: user.id, email: user.email })
  user.password = undefined

  res.status(200).cookie('token', token, OPTIONS).json({
    msg: 'Successful login!',
    token,
    user,
  })
}

export const expiresAndSendCookie = (res: Response) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  })

  res.status(200).json({
    msg: 'Successful sign out!',
  })
}
