import { Request, Response, NextFunction } from 'express'

const superPromise =
  (func: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(func(req, res, next)).catch(next)

export default superPromise
