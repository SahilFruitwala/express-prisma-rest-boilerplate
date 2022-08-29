import { Request, Response, NextFunction } from 'express'

import CustomError from '../utils/customError'
import { verifyToken } from '../utils/jwt'
import prisma from '../../prisma'
import SuperPromise from '../middlewares/superPromise'

const isLoggedIn = SuperPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies.token || req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return next(new CustomError('User is not logged in!', 401))
    }

    const decodedData = verifyToken(token)

    req.user = await prisma.user.findUnique({
      where: { id: decodedData?.user_id },
    })

    next()
  }
)

export default isLoggedIn
