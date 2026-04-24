import { z } from 'zod'

export const createStationSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre no puede superar 100 caracteres'),
  lat:  z.number({ error: 'La latitud debe ser un número' }).min(-90, 'La latitud debe estar entre -90 y 90').max(90, 'La latitud debe estar entre -90 y 90'),
  lng:  z.number({ error: 'La longitud debe ser un número' }).min(-180, 'La longitud debe estar entre -180 y 180').max(180, 'La longitud debe estar entre -180 y 180'),
})

export const updateStationSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  lat:  z.number().min(-90).max(90).optional(),
  lng:  z.number().min(-180).max(180).optional(),
})

export const assignStationSchema = z.object({
  routeId: z.string().min(1, 'routeId es requerido'),
  order:   z.number({ error: 'El orden debe ser un número' }).int('El orden debe ser un entero').min(1, 'El orden mínimo es 1'),
})
