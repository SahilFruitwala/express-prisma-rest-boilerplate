import * as dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

dotenv.config()

import './utils/prismaHooks'

import expensesRoute from './routes/expensesRoute'
import itemsRoute from './routes/itemsRoute'
import shoppingListRoute from './routes/shoppingListRoute'
import userRoute from './routes/userRoutes'

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'))

app.use('/api/v1', expensesRoute)
app.use('/api/v1', itemsRoute)
app.use('/api/v1', shoppingListRoute)
app.use('/api/v1', userRoute)

export default app
