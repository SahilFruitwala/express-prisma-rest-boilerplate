import { Response, NextFunction } from 'express'

import CustomError from '../utils/customError'
import prisma from '../../prisma'
import SuperPromise from '../middlewares/superPromise'

import { UpdatedRequest } from '../types/updatedRequest'

export const addItem = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const { name, shoppingListId } = req.body

    if (!name) {
      return next(new CustomError('Provide all details!', 400))
    }

    const newItem = await prisma.item.create({
      data: {
        name,
        shoppingList: {
          connect: {
            id: shoppingListId,
          },
        },
      },
      include: {
        shoppingList: false,
      },
    })

    res.status(201).json(newItem)
  }
)

export const updateItem = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const id = req.params.id
    const { done, name } = req.body

    if (!done && !name) {
      return next(new CustomError('Provide all details!', 400))
    }

    const item: prisma.item = await prisma.item.findUnique({
      where: { id },
      include: { shoppingList: false },
    })

    const updatedItem = await prisma.item.update({
      where: {
        id,
      },
      data: {
        done: done !== undefined ? done : item.status,
        name: name !== undefined ? name : item.name,
      },
      include: {
        shoppingList: false,
      },
    })

    res.status(201).json(updatedItem)
  }
)

export const deleteItem = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const id = req.params.id

    await prisma.item.delete({
      where: {
        id,
      },
    })

    res.status(201).json({ msg: 'Success!' })
  }
)
