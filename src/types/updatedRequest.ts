import { Request } from 'express'
import prisma from '../../prisma'

export type UpdatedRequest = Request & {
  user: prisma.user
}
