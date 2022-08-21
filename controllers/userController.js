const bcrypt = require('bcryptjs')
const cloudinary = require('cloudinary').v2
const crypto = require('crypto')
const fileUpload = require('express-fileupload')

const prisma = require('../prisma')
const SuperPromise = require('../middleware/superPromise')
const generateAndSendCookie = require('../utils/cookie')
const CustomError = require('../utils/customError')

const {
  DEFAULT_AVTAR_1_ID,
  DEFAULT_AVTAR_1_URL,
  DEFAULT_AVTAR_2_ID,
  DEFAULT_AVTAR_2_URL,
  DEFAULT_AVTAR_3_ID,
  DEFAULT_AVTAR_3_URL,
  DEFAULT_AVTAR_4_ID,
  DEFAULT_AVTAR_4_URL,
} = process.env

const DEFAULT_AVATAR = [
  { public_id: DEFAULT_AVTAR_1_ID, secure_url: DEFAULT_AVTAR_1_URL },
  { public_id: DEFAULT_AVTAR_2_ID, secure_url: DEFAULT_AVTAR_2_URL },
  { public_id: DEFAULT_AVTAR_3_ID, secure_url: DEFAULT_AVTAR_3_URL },
  { public_id: DEFAULT_AVTAR_4_ID, secure_url: DEFAULT_AVTAR_4_URL },
]

exports.signUp = SuperPromise(async (req, res, next) => {
  const { name, email, password } = req.body
  let result = {
    public_id: '',
    secure_url: '',
  }

  if (req.files) {
    const file = req.files.avatar
    result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'life-management/users',
      width: 150,
      crop: 'scale',
    })
  } else {
    const randomAvatar = Math.floor(Math.random() * 4)
    result.public_id = DEFAULT_AVATAR[randomAvatar].public_id
    result.secure_url = DEFAULT_AVATAR[randomAvatar].secure_url
  }

  if (!(name && email && password)) {
    return next(new CustomError('All fields are required.', 400))
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })
  if (existingUser) {
    return next(new CustomError('User already exists.', 400))
  }

  console.log(result)

  const newUser = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password,
      photo: {
        create: {
          publicId: result.public_id,
          secureUrl: result.secure_url,
        },
      },
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
      photo: {
        select: {
          secureUrl: true,
        },
      },
    },
  })

  if (!(user && (await bcrypt.compare(password, user.password)))) {
    return next(new CustomError('Check your email/password!', 401))
  }

  // cookie op
  generateAndSendCookie(user, res)
})

exports.signOut = SuperPromise(async (req, res, next) => {})

exports.resetPassword = SuperPromise(async (req, res, next) => {
  // generate random string
  const seedString = crypto.randomBytes(20).toString('hex')
  const passResetToken = crypto
    .createHash('sha-256')
    .update(seedString)
    .digest('hex')

  const passResetExpiry = Date.now() + 60 * 60 * 1000

  // we need that random generated string.
  // TODO: think about the solution you will need to store
})

exports.changePassword = SuperPromise(async (req, res, next) => {
  // generate random string
  const { email, oldPassword, newPassword, newPassword1 } = req.body

  if (!(email && oldPassword && newPassword && newPassword1)) {
    return next(new CustomError('All fields are required.', 400))
  }

  if (newPassword === newPassword1) {
    return next(new CustomError("Passwords don't match!", 400))
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
    },
  })

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    return next(new CustomError('Check your password!', 400))
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: newPassword,
    },
  })
  updatedUser.password = undefined

  res.status(204).json({
    msg: 'Password changes successfully!',
  })
})

exports.updateUser = SuperPromise(async (req, res, next) => {
  // generate random string
  const { email, name } = req.body

  if (!(email && name)) {
    return next(new CustomError('All fields are required.', 400))
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
    },
  })

  if (!user) {
    return next(new CustomError('Check your password!', 400))
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      email: email.toLowerCase(),
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })
  // TODO: remove this if select in update works
  updatedUser.password = undefined

  res.status(202).json({
    msg: 'Password changes successfully!',
    user: updatedUser,
  })
})

exports.getUser = SuperPromise(async (req, res, next) => {
  const { email } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  if (!user) {
    return next(new CustomError("User doesn't exists!", 404))
  }

  res.status(200).json({
    msg: 'Password changes successfully!',
    user,
  })
})
