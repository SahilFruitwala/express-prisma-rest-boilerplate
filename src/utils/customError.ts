class CustomError extends Error {
  statusCode: number = 400

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.stack = undefined // don't want show details about code
  }
  
}

export default CustomError
