const CustomError = require('../utils/customError')
const prisma = require('../prisma')
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
      user: true,
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
  })

  res.status(201).json(shoppingList)
})
