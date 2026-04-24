import { z } from 'zod'

export const createLineSchema = z.object({
  name:        z.string().trim().min(1, 'El nombre es requerido').max(50, 'El nombre no puede superar 50 caracteres'),
  description: z.string().max(200, 'La descripción no puede superar 200 caracteres').optional(),
  origin:      z.string().optional(),
  destination: z.string().optional(),
})

export const updateLineSchema = z.object({
  name:        z.string().trim().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  origin:      z.string().optional(),
  destination: z.string().optional(),
  active:      z.boolean().optional(),
})
