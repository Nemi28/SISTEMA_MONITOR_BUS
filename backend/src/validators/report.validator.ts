import { z } from 'zod'

export const createReportSchema = z.object({
  busId:          z.string().min(1, 'El bus es requerido'),
  lat:            z.number({ error: 'La latitud debe ser un número' }).min(-90, 'La latitud debe estar entre -90 y 90').max(90, 'La latitud debe estar entre -90 y 90'),
  lng:            z.number({ error: 'La longitud debe ser un número' }).min(-180, 'La longitud debe estar entre -180 y 180').max(180, 'La longitud debe estar entre -180 y 180'),
  passengerCount: z.number({ error: 'La cantidad de pasajeros debe ser un número' }).int('Debe ser un número entero').min(0, 'No puede ser negativo'),
  speed:          z.number({ error: 'La velocidad debe ser un número' }).min(0, 'La velocidad no puede ser negativa').max(150, 'La velocidad máxima es 150 km/h').optional(),
})
