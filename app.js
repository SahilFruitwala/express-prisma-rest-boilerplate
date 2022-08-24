require('dotenv').config()

const cookieParser = require('cookie-parser')
const express = require('express')
const fileUpload = require('express-fileupload')
const morgan = require('morgan')

require('./utils/prismaHooks')

const itemsRoute = require('./routes/itemsRoute')
const shoppingListRoute = require('./routes/shoppingListRoute')
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
app.use('/api/v1', itemsRoute)
app.use('/api/v1', shoppingListRoute)
app.use('/api/v1', userRoute)

module.exports = app
