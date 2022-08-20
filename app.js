require('dotenv').config()
require('./config/database.js').connect()

const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const { SECRET_KEY } = process.env
const User = require('./model/user')
const auth = require('./middleware/auth')

const app = express()

app.use(express.json())
app.use(cookieParser())

app.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!(name && email && password)) {
      res.status(400).send('All fields are required.')
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(401).send('User already exists.')
    }

    const encryptedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
    })

    // token
    const token = jwt.sign({ user_id: newUser._id, email }, SECRET_KEY, {
      expiresIn: '2h',
    })
    newUser.token = token
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
      res.status(400).send('All fields are required.')
    }

    const user = await User.findOne({ email })
    if (!(user && (await bcrypt.compare(password, user.password)))) {
      res.status(400).send('Check your email/password!')
    }

    // token
    const token = jwt.sign({ user_id: user._id, email }, SECRET_KEY, {
      expiresIn: '2h',
    })

    user.token = token
    user.password = undefined

    // res.status(200).json(user)

    // OTHER METHOD TO SEND TOKEN
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }

    // token and user are not required to send in json()
    res
      .status(200)
      .cookie('token', token, options)
      .json({ msg: 'Login Successful!', token, user })
  } catch (error) {
    console.log(error)
  }
})

app.get('/home', auth, (req, res, next) => {
  res.send('<h1>Welcome Home!</h1>')
})

module.exports = app
