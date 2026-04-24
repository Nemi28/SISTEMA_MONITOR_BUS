import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    const message = result.error.issues[0].message
    return res.status(400).json({ success: false, message })
  }
  req.body = result.data
  next()
}
