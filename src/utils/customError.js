class CustomError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.stack = undefined // don't want show details about code
  }
}

module.exports = CustomError
