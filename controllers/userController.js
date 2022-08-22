const bcrypt = require('bcryptjs')
const cloudinary = require('cloudinary').v2
const { randomBytes, createHash } = require('node:crypto')

const CustomError = require('../utils/customError')
const mailHelper = require('../utils/emailHelper')
const prisma = require('../prisma')
const SuperPromise = require('../middleware/superPromise')
const {
  generateAndSendCookie,
  expiresAndSendCookie,
} = require('../utils/cookie')
// const DEFAULT_AVATAR = require('../data/defaultAvatar')

exports.signUp = SuperPromise(async (req, res, next) => {
  const { name, email, password } = req.body

  if (!(name && email && password && req.files)) {
    return next(new CustomError('All fields are required.', 400))
  }
  const file = req.files.avatar
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'life-management/users',
    width: 150,
    crop: 'scale',
  })

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
      photoSecureUrl: result.secure_url,
      photoPublicId: result.public_id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      photoSecureUrl: true,
      photoPublicId: true,
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
      photoSecureUrl: true,
      photoPublicId: true,
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

  let result = {
    public_id: user.photoPublicId,
    secure_url: user.photoSecureUrl,
  }
  if (req.files) {
    try {
      const file = req.files.avatar
      result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'life-management/users',
        width: 150,
        crop: 'scale',
      })
    } catch (error) {
      return next(
        new CustomError('Something went wrong while uploading image!', 500)
      )
    }
    try {
      await cloudinary.uploader.destroy(user.photoPublicId, {
        resource_type: 'image',
      })
    } catch (error) {
      await cloudinary.uploader.destroy(result.public_id, {
        resource_type: 'image',
      })
      return next(new CustomError('Something went wrong!', 500))
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      email: email?.toLowerCase() || user.email,
      name: name || user.name,
      photoPublicId: result.public_id,
      photoSecureUrl: result.secure_url,
    },
    select: {
      id: true,
      email: true,
      name: true,
      photoPublicId: true,
      photoSecureUrl: true,
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
      photoPublicId: true,
      photoSecureUrl: true,
    },
  })

  res.status(200).json({
    success: true,
    user,
  })
})
