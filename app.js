require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

require('./utils/prismaHooks')

const homeRoute = require('./routes/homeRoutes')
const userRoute = require('./routes/userRoutes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('tiny'))

// all routes
app.use('/api/v1', homeRoute)
app.use('/api/v1/user', userRoute)

module.exports = app
