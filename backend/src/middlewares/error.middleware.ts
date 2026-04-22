import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', err)

  const status = err.status || 500
  const message = err.message || 'Error interno del servidor'

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.url} no encontrada`,
  })
}