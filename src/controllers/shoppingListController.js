const CustomError = require('../utils/customError')
const prisma = require('../../prisma')
const superPromise = require('../middleware/superPromise')

exports.createList = superPromise(async (req, res, next) => {
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
})

exports.getList = superPromise(async (req, res, next) => {
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
})

exports.updateList = superPromise(async (req, res, next) => {
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
})

exports.deleteList = superPromise(async (req, res, next) => {
  const id = req.params.id

  await prisma.shoppingList.delete({
    where: {
      id,
    },
  })
  res.status(200).json({ msg: 'Success!' })
})
