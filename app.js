require('dotenv').config()

const express = require('express')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')

const auth = require('./middleware/auth')
const prisma = require('./prisma')
const { generateCookie } = require('./utils/cookie')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!(name && email && password)) {
      res.status(400).send('All fields are required.')
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    if (existingUser) {
      res.status(401).send('User already exists.')
    }

    const encryptedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: encryptedPassword,
      },
    })
    newUser.password = undefined

    res.status(201).json(newUser)
  } catch (error) {
    console.log(error)
  }
})

app.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!(email && password)) {
      return res.status(400).send('All fields are required.')
    }

    const user = await await prisma.user.findUnique({
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
    // res.status(200).json(user)

    // cookie op
    generateCookie(user, res)
  } catch (error) {
    console.log(error)
  }
})

app.get('/home', auth, (req, res, next) => {
  res.send('<h1>Welcome Home!</h1>')
})

module.exports = app
