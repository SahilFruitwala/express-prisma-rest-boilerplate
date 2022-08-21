const bcrypt = require('bcryptjs')
const prisma = require('../prisma')
// const crypto = require('crypto')

module.exports = prisma.$use(async (params, next) => {
  const password = params.args.data?.password
  if (
    params.model === 'User' &&
    (params.action === 'create' || params.action === 'update') &&
    password
  ) {
    params.args.data.password = await bcrypt.hash(password, 10)
  }
  // TODO: Add this hook if you want to generate reset password here
  // console.log(params.args.where)
  // if (
  //   params.model === 'User' &&
  //   params.action === 'create' &&
  //   params.args.data?.generateToken
  // ) {
  //   delete params.args.data.generateToken
  //   const seedString = crypto.randomBytes(20).toString('hex')
  //   // this is generating a hash value
  //   params.args.data.passResetToken = crypto
  //     .createHash('sha-256')
  //     .update(seedString)
  //     .digest('hex')
  // }
  return next(params)
})
