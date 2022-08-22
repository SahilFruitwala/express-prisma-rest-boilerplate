const CustomError = require('../utils/customError')
const { verifyToken } = require('../utils/jwt')
const prisma = require('../prisma')
const SuperPromise = require('./superPromise')

exports.isLoggedIn = SuperPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return next(new CustomError('User is not logged in!', 401))
  }

  const decodedData = verifyToken(token)

  req.user = await prisma.user.findUnique({
    where: { id: decodedData.user_id },
  })

  next()
})
