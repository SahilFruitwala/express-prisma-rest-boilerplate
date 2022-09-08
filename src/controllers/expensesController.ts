import { Response, NextFunction } from 'express'

import CustomError from '../utils/customError'
import prisma from '../../prisma'
import SuperPromise from '../middlewares/superPromise'
import { UpdatedRequest } from '../types/updatedRequest'

export const addExpense = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const { name, category, amount, date } = req.body

    if (!name || !amount || !category || !date) {
      return next(new CustomError('Provide all necessary details!', 400))
    }

    const newDate = new Date(date)

    const newExpense = await prisma.expense.create({
      data: {
        name,
        category,
        amount: +amount,
        date: newDate.getDate(),
        month: newDate.getMonth() + 1,
        year: newDate.getFullYear(),
        user: {
          connect: {
            id: req.user.id,
          },
        },
      },
      include: {
        user: false,
      },
    })

    res.status(201).json(newExpense)
  }
)

export const getExpenses = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const { limit, offset } = req.query
    const { user } = req

    const expenses = await prisma.$transaction([
      prisma.expense.count({
        where: {
          userId: user.id,
        },
      }),
      // @ts-ignore
      prisma.expense.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          date: 'desc',
        },
        select: {
          name: true,
          category: true,
          amount: true,
          date: true,
          month: true,
          year: true,
        },
        include: {
          user: false,
        },
        take: +limit,
        skip: +offset,
      }),
    ])

    res.status(200).json({ msg: 'Success!', expenses })
  }
)

export const updateExpense = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const id = req.params.id
    const { name, category, date, amount } = req.body

    if (!name && !category && !amount) {
      return next(new CustomError('Provide all details!', 400))
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
      include: { user: false },
    })

    const newDate = {}
    if (date) {
      const updateDate = new Date(date)
      newDate['month'] = updateDate.getMonth() + 1
      newDate['date'] = updateDate.getDate()
      newDate['year'] = updateDate.getFullYear()
    }

    const updatedItem = await prisma.expense.update({
      where: {
        id,
      },
      data: {
        name: name ? name : existingExpense.name,
        amount: amount ? amount : existingExpense.amount,
        date: newDate?.date ? newDate.date : existingExpense.date,
        month: newDate?.month ? newDate.month : existingExpense.month,
        year: newDate?.year ? newDate.year : existingExpense.year,
        category: category ? category : existingExpense.category,
      },
      include: {
        user: false,
      },
    })

    res.status(201).json(updatedItem)
  }
)

export const deleteExpense = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const id = req.params.id

    await prisma.expense.delete({
      where: {
        id,
      },
    })

    res.status(201).json({ msg: 'Success!' })
  }
)

export const getSummary = SuperPromise(
  async (req: UpdatedRequest, res: Response, next: NextFunction) => {
    const { options, year, month } = req.body
    const { user } = req

    const summary = await prisma.expense.groupBy({
      by: [...options],
      where: {
        userId: user.id,
        year,
        month,
      },
      _sum: {
        amount: true,
      },
    })

    res.status(202).json(summary)
  }
)
