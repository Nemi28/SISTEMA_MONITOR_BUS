import { z } from 'zod'

export const createBusSchema = z.object({
  code:     z.string().trim().min(1, 'El código es requerido').max(20, 'El código no puede superar 20 caracteres'),
  plate:    z.string().trim().min(1, 'La placa es requerida').max(10, 'La placa no puede superar 10 caracteres'),
  capacity: z.number({ error: 'La capacidad debe ser un número' }).int('La capacidad debe ser un número entero').min(1, 'La capacidad mínima es 1').max(200, 'La capacidad máxima es 200'),
  model:    z.string().max(50, 'El modelo no puede superar 50 caracteres').optional(),
  routeId:  z.string().optional(),
})

export const updateBusSchema = z.object({
  status:  z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'], { error: 'Estado inválido' }).optional(),
  routeId: z.string().nullable().optional(),
})
