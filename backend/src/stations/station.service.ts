import prisma from '../prisma/prisma.service'

export const getStationsByLine = async (lineId: string) => {
  return prisma.station.findMany({
    where: { routeId: lineId },
    orderBy: { order: 'asc' },
  })
}

export const createStation = async (data: {
  routeId: string
  name: string
  lat: number
  lng: number
  order: number
}) => {
  return prisma.station.create({ data })
}

export const updateStation = async (id: string, data: {
  name?: string
  lat?: number
  lng?: number
  order?: number
}) => {
  return prisma.station.update({ where: { id }, data })
}

export const deleteStation = async (id: string) => {
  return prisma.station.delete({ where: { id } })
}
