const CustomError = require('../utils/customError')
const prisma = require('../prisma')
const superPromise = require('../middleware/superPromise')

exports.addExpense = superPromise(async (req, res, next) => {
  const { name, category, amount, date } = req.body

  if (!name || !amount || !category || !date) {
    return next(new CustomError('Provide all necessary details!', 400))
  }

  const newExpense = await prisma.expense.create({
    data: {
      name,
      category,
      amount: +amount,
      date: new Date(date),
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
})

exports.getExpenses = superPromise(async (req, res, next) => {
  const { limit, offset } = req.query
  const { user } = req

  const expenses = await prisma.$transaction([
    prisma.expense.count({
      where: {
        userId: user.id,
      },
    }),
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
      },
      take: +limit,
      skip: +offset,
    }),
  ])

  res.status(200).json({ msg: 'Success!', expenses })
})

exports.updateExpense = superPromise(async (req, res, next) => {
  const id = req.params.id
  const { name, category, date, amount } = req.body

  if (!name && !category && !date && !amount) {
    return next(new CustomError('Provide all details!', 400))
  }

  const existingExpense = await prisma.expense.findUnique({
    where: { id },
    include: { user: false },
  })

  const updatedItem = await prisma.expense.update({
    where: {
      id,
    },
    data: {
      name: name !== undefined ? name : existingExpense.name,
      amount: amount !== undefined ? amount : existingExpense.amount,
      date: date !== undefined ? date : existingExpense.date,
      category: category !== undefined ? category : existingExpense.category,
    },
    include: {
      user: false,
    },
  })

  res.status(201).json(updatedItem)
})

exports.deleteExpense = superPromise(async (req, res, next) => {
  const id = req.params.id

  await prisma.expense.delete({
    where: {
      id,
    },
  })

  res.status(201).json({ msg: 'Success!' })
})
