const bcrypt = require('bcryptjs')

const prisma = require('../prisma')
const generateCookie = require('../utils/cookie')
const SuperPromise = require('../middleware/superPromise')

exports.signUp = SuperPromise(async (req, res, next) => {
  const { name, email, password } = req.body

  if (!(name && email && password)) {
    return res.status(400).send('All fields are required.')
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })
  if (existingUser) {
    return res.status(401).send('User already exists.')
  }

  //   const encryptedPassword = await bcrypt.hash(password, 10)

  const newUser = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password,
      temp: true,
    },
  })
  newUser.password = undefined

  res.status(201).json(newUser)
})

exports.signIn = SuperPromise(async (req, res, next) => {
  const { email, password } = req.body
  if (!(email && password)) {
    return res.status(400).send('All fields are required.')
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
    return res.status(400).send('Check your email/password!')
  }

  // cookie op
  generateCookie(user, res)
})

exports.signOut = SuperPromise(async (req, res, next) => {
  const { email, password } = req.body
  if (!(email && password)) {
    return res.status(400).send('All fields are required.')
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
    return res.status(400).send('Check your email/password!')
  }

  // cookie op
  generateCookie(user, res)
})
