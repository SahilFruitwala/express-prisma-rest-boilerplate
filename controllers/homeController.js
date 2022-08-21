const SuperPromise = require('../middleware/superPromise')

exports.home = SuperPromise((req, res) => {
  res.status(200).json({
    message: 'Successful!',
  })
})
