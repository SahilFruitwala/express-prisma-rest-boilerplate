const CustomError = require('../utils/customError')
const prisma = require('../../prisma')
const superPromise = require('../middlewares/superPromise')

exports.addItem = superPromise(async (req, res, next) => {
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
})

exports.updateItem = superPromise(async (req, res, next) => {
  const id = req.params.id
  const { done, name } = req.body

  if (!done && !name) {
    return next(new CustomError('Provide all details!', 400))
  }

  const item = await prisma.item.findUnique({
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
})

exports.deleteItem = superPromise(async (req, res, next) => {
  const id = req.params.id

  await prisma.item.delete({
    where: {
      id,
    },
  })

  res.status(201).json({ msg: 'Success!' })
})
