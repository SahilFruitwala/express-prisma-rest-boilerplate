import { Request, Response, NextFunction } from 'express'

import CustomError from '../utils/customError'
import prisma from '../../prisma'
import SuperPromise from '../middlewares/superPromise'

export const createList = SuperPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body
    const { user } = req

    if (!name) {
      return next(new CustomError('Provide all details!', 400))
    }

    const newShoppingList = await prisma.shoppingList.create({
      data: {
        name,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        user: false,
      },
    })

    res.status(201).json(newShoppingList)
  }
)

export const getList = SuperPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req

    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        items: true,
        user: false,
      },
    })

    res.status(201).json(shoppingList)
  }
)

export const updateList = SuperPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const { name } = req.body

    if (!name) {
      return next(new CustomError('Provide all details!', 400))
    }

    const shoppingList = await prisma.shoppingList.update({
      where: {
        id,
      },
      data: {
        name,
      },
      include: {
        user: false,
        items: false,
      },
    })

    res.status(201).json(shoppingList)
  }
)

export const deleteList = SuperPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id

    await prisma.shoppingList.delete({
      where: {
        id,
      },
    })
    res.status(200).json({ msg: 'Success!' })
  }
)
