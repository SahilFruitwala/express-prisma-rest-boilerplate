const CustomError = require('../utils/customError')
const prisma = require('../prisma')
const superPromise = require('../middleware/superPromise')

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
  const itemId = req.params.itemId
  const { done, name } = req.body

  if (!done && !name) {
    return next(new CustomError('Provide all details!', 400))
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } })

  const updatedItem = await prisma.item.update({
    where: {
      id: itemId,
    },
    data: {
      done: done !== undefined ? done : item.status,
      name: name !== undefined ? name : item.name,
    },
  })

  res.status(201).json(updatedItem)
})

exports.deleteItem = superPromise(async (req, res, next) => {
  const itemId = req.params.itemId

  await prisma.item.delete({
    where: {
      id: itemId,
    },
  })

  res.status(201).json({ msg: 'Success!' })
})
