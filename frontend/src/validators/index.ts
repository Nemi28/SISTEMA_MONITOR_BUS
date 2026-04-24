import { z } from 'zod'

export const busSchema = z.object({
  code:     z.string().min(1, 'El código es requerido').max(20, 'Máximo 20 caracteres'),
  plate:    z.string().min(1, 'La placa es requerida').max(10, 'Máximo 10 caracteres'),
  capacity: z.coerce.number({ error: 'Debe ser un número' }).int('Debe ser entero').min(1, 'Mínimo 1').max(200, 'Máximo 200'),
  model:    z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  routeId:  z.string().optional().or(z.literal('')),
})

export const reportSchema = z.object({
  busId:          z.string().min(1, 'Selecciona un bus'),
  lat:            z.number({ error: 'Debe ser un número' }).min(-90, 'Mín -90').max(90, 'Máx 90'),
  lng:            z.number({ error: 'Debe ser un número' }).min(-180, 'Mín -180').max(180, 'Máx 180'),
  passengerCount: z.number({ error: 'Debe ser un número' }).int('Debe ser entero').min(0, 'No puede ser negativo'),
  speed:          z.number({ error: 'Debe ser un número' }).min(0, 'No puede ser negativa').max(150, 'Máximo 150 km/h').optional(),
})

export const lineSchema = z.object({
  name:        z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
  description: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
})

export const stationSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  lat:  z.coerce.number({ error: 'Debe ser un número' }).min(-90, 'Mín -90').max(90, 'Máx 90'),
  lng:  z.coerce.number({ error: 'Debe ser un número' }).min(-180, 'Mín -180').max(180, 'Máx 180'),
})

export type BusFormData     = z.infer<typeof busSchema>
export type ReportFormData  = z.infer<typeof reportSchema>
export type LineFormData    = z.infer<typeof lineSchema>
export type StationFormData = z.infer<typeof stationSchema>
