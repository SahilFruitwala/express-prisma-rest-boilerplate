require('dotenv').config()

const cookieParser = require('cookie-parser')
const express = require('express')
const fileUpload = require('express-fileupload')
const morgan = require('morgan')

require('./utils/prismaHooks')

const homeRoute = require('./routes/homeRoutes')
const userRoute = require('./routes/userRoutes')

const app = express()

app.use(cookieParser())
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'))

// all routes
app.use('/api/v1', homeRoute)
app.use('/api/v1', userRoute)

module.exports = app
