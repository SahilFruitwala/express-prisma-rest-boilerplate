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
      shoppingList: true,
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

exports.getList = superPromise(async (req, res, next) => {
  const { user } = req

  const shoppingList = await prisma.shoppingList.findUnique({
    where: {
      userId: user.id,
    },
  })

  res.status(201).json(shoppingList)
})

exports.updateList = superPromise(async (req, res, next) => {
  const shoppingListId = req.params.shoppingListId
  const { name } = req.body

  const shoppingList = await prisma.shoppingList.update({
    where: {
      id: shoppingListId,
    },
    data: {
      name,
    },
  })

  res.status(201).json(shoppingList)
})

// TODO: DELETE SHOPPING LIST
