import prisma from '../prisma/prisma.service'

export const getAllStations = async () => {
  return prisma.station.findMany({ orderBy: { name: 'asc' } })
}

export const getStationsByLine = async (routeId: string) => {
  const rows = await prisma.routeStation.findMany({
    where: { routeId },
    include: { station: true },
    orderBy: { order: 'asc' },
  })
  return rows.map((r) => ({ ...r.station, order: r.order }))
}

export const getAvailableForRoute = async (routeId: string) => {
  const assigned = await prisma.routeStation.findMany({
    where: { routeId },
    select: { stationId: true },
  })
  const assignedIds = assigned.map((r) => r.stationId)
  return prisma.station.findMany({
    where: { id: { notIn: assignedIds.length ? assignedIds : [''] } },
    orderBy: { name: 'asc' },
  })
}

export const createStation = async (data: { name: string; lat: number; lng: number }) => {
  return prisma.station.create({ data })
}

export const assignStation = async (stationId: string, routeId: string, order: number) => {
  return prisma.routeStation.create({ data: { routeId, stationId, order } })
}

export const unassignStation = async (stationId: string, routeId: string) => {
  return prisma.routeStation.delete({ where: { routeId_stationId: { routeId, stationId } } })
}

export const updateStation = async (id: string, data: { name?: string; lat?: number; lng?: number }) => {
  return prisma.station.update({ where: { id }, data })
}

export const updateStationOrder = async (routeId: string, stationId: string, order: number) => {
  return prisma.routeStation.update({
    where: { routeId_stationId: { routeId, stationId } },
    data: { order },
  })
}

export const deleteStation = async (id: string) => {
  return prisma.station.delete({ where: { id } })
}
