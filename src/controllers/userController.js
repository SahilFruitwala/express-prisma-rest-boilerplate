const bcrypt = require('bcryptjs')
const { randomBytes, createHash } = require('node:crypto')

const CustomError = require('../utils/customError')
const mailHelper = require('../utils/emailHelper')
const prisma = require('../../prisma')
const SuperPromise = require('../middlewares/superPromise')
const {
  generateAndSendCookie,
  expiresAndSendCookie,
} = require('../utils/cookie')

exports.signUp = SuperPromise(async (req, res, next) => {
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
})

exports.signIn = SuperPromise(async (req, res, next) => {
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
})

exports.signOut = SuperPromise(async (req, res, next) => {
  expiresAndSendCookie(res)
})

exports.forgotPassword = SuperPromise(async (req, res, next) => {
  const { email } = req.body

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return res.status(200).json({
      msg: 'If account with given email is there you will receive instruction soon!',
    })
  }

  // generate random string
  const forgotToken = randomBytes(20).toString('hex')
  const passResetToken = createHash('sha256').update(forgotToken).digest('hex')
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
  } catch (err) {
    await prisma.user.update({
      where: { email },
      data: {
        passResetToken: null,
        passResetExpiry: null,
      },
    })

    return next(new CustomError(err.message, 500))
  }
})

exports.resetPassword = SuperPromise(async (req, res, next) => {
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
    return next(new CustomError("You can't use one of the old passwords!", 400))
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
})

exports.changePassword = SuperPromise(async (req, res, next) => {
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
})

exports.updateUser = SuperPromise(async (req, res, next) => {
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
})

exports.getUser = SuperPromise(async (req, res, next) => {
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
})
