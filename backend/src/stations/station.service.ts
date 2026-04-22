import prisma from '../prisma/prisma.service'

export const getStationsByLine = async (lineId: string) => {
  return prisma.estacion.findMany({
    where: { rutaId: lineId },
    orderBy: { orden: 'asc' },
  })
}

export const createStation = async (data: {
  rutaId: string
  nombre: string
  latitud: number
  longitud: number
  orden: number
}) => {
  return prisma.estacion.create({ data })
}

export const updateStation = async (id: string, data: {
  nombre?: string
  latitud?: number
  longitud?: number
  orden?: number
}) => {
  return prisma.estacion.update({ where: { id }, data })
}

export const deleteStation = async (id: string) => {
  return prisma.estacion.delete({ where: { id } })
}