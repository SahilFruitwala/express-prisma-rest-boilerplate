import { Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { randomBytes, createHash } from 'node:crypto'

import CustomError from '../utils/customError'
import mailHelper from '../utils/emailHelper'
import prisma from '../../prisma'
import SuperPromise from '../middlewares/superPromise'
import { generateAndSendCookie, expiresAndSendCookie } from '../utils/cookie'

import { UpdatedRequest } from '../types/updatedRequest'

export const signUp = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body

    if (!(name && email && password)) {
      return next(new CustomError('All fields are required.', 400))
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    if (existingUser) {
      return next(new CustomError('User already exists.', 400))
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    res.status(201).json(newUser)
  }
)

export const signIn = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    if (!(email && password)) {
      return next(new CustomError('All fields are required.', 400))
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    })

    if (!(user && (await bcrypt.compare(password, user.password)))) {
      return next(new CustomError('Check your email/password!', 401))
    }

    // cookie op
    generateAndSendCookie(user, res)
  }
)

export const signOut = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    expiresAndSendCookie(res)
  }
)

export const forgotPassword = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const { email } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(200).json({
        msg: 'If account with given email is there you will receive instruction soon!',
      })
    }

    // generate random string
    const forgotToken = randomBytes(20).toString('hex')
    const passResetToken = createHash('sha256')
      .update(forgotToken)
      .digest('hex')
    const passResetExpiry = Date.now() + 60 * 60 * 1000

    await prisma.user.update({
      where: { email },
      data: {
        passResetToken,
        passResetExpiry,
      },
    })

    const myURL = `${req.protocol}://${req.get(
      'host'
    )}/password/reset/${forgotToken}`

    const emailData = {
      subject: 'Password Reset',
      body: `Copy given URL and paste it in your browser.\n\n${myURL}`,
    }

    try {
      await mailHelper(email, emailData)
      return res.status(200).json({
        msg: 'If account with given email is there you will receive instruction soon!',
      })
    } catch (err: any) {
      await prisma.user.update({
        where: { email },
        data: {
          passResetToken: null,
          passResetExpiry: null,
        },
      })

      return next(new CustomError(err.message, 500))
    }
  }
)

export const resetPassword = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const token = req.params.token
    const { password, confirmPassword } = req.body

    const encryptToken = createHash('sha256').update(token).digest('hex')

    const user = await prisma.user.findFirst({
      where: {
        AND: {
          passResetExpiry: {
            gt: Date.now(),
          },
          passResetToken: {
            equals: encryptToken,
          },
        },
      },
    })

    if (!user) {
      return next(new CustomError('Token is invalid/expired', 400))
    }

    if (password !== confirmPassword) {
      return next(
        new CustomError("Password and confirm password don't match", 400)
      )
    }

    if (await bcrypt.compare(password, user.password)) {
      return next(
        new CustomError("You can't use one of the old passwords!", 400)
      )
    }

    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        password: req.body.password,
        passResetToken: null,
        passResetExpiry: null,
      },
    })

    res.status(202).json({ msg: 'Password reset Successful!' })
  }
)

export const changePassword = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const { email, oldPassword, password, confirmPassword } = req.body

    if (!(email && oldPassword && password && confirmPassword)) {
      return next(new CustomError('All fields are required.', 400))
    }

    if (password !== confirmPassword) {
      return next(new CustomError("Passwords don't match!", 400))
    }

    if (!(await bcrypt.compare(oldPassword, req.user.password))) {
      return next(new CustomError('Check your password!', 400))
    }

    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        password,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    res.status(204).json({
      msg: 'Password changes successfully!',
    })
  }
)

export const updateUser = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const { email, name } = req.body
    const { user } = req

    if (!email && !name) {
      return next(new CustomError('Please enter valid data!', 400))
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: email?.toLowerCase() || user.email,
        name: name || user.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    res.status(202).json({
      msg: 'Password changes successfully!',
      user: updatedUser,
    })
  }
)

export const getUser = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    res.status(200).json({
      success: true,
      user,
    })
  }
)
