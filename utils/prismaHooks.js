const bcrypt = require('bcryptjs')
const prisma = require('../prisma')
// const { generateToken } = require('../utils/jwt')

module.exports = prisma.$use(async (params, next) => {
  const password = params.args.data?.password
  if (params.model === 'User' && params.action === 'create' && password) {
    params.args.data.password = await bcrypt.hash(password, 10)
  }
//   console.log(params.args)
  //   if (
  //     params.model === 'User' &&
  //     params.action === 'create' &&
  //     params.args.data?.generateToken
  //   ) {
  //     delete params.args.data.generateToken
  //     params.args.data.passResetToken = generateToken({
  //       user_id: user.id,
  //       email: user.email,
  //     })
  //   }
  return next(params)
})
