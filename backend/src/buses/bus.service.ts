import prisma from '../prisma/prisma.service'
import { BusStatus } from '@prisma/client'
import { getBusProgressInfo } from '../simulation/simulation.service'
import { haversineKm } from '../utils/geo'

const routeStationsInclude = {
  routeStations: {
    include: { station: { select: { id: true, name: true, lat: true, lng: true } } },
    orderBy: { order: 'asc' as const },
  },
}

const computeETA = (busId: string, report: any, routeStations: any[]) => {
  const empty = { currentStation: null, nextStation: null, etaMinutes: null, returning: false, routeProgress: 0 }
  if (!report || routeStations.length < 2) return empty

  const prog = getBusProgressInfo(busId)
  if (!prog) return empty

  const currentRs = routeStations[prog.stationIdx]
  const nextIdx   = Math.max(0, Math.min(routeStations.length - 1, prog.stationIdx + prog.direction))
  const nextRs    = routeStations[nextIdx]
  if (!currentRs || !nextRs) return empty

  const dist       = haversineKm(report.lat, report.lng, nextRs.station.lat, nextRs.station.lng)
  const speed      = report.speed && report.speed > 0 ? report.speed : 25
  const etaMinutes = Math.max(1, Math.round((dist / speed) * 60))

  return {
    currentStation: { id: currentRs.station.id, name: currentRs.station.name, order: currentRs.order },
    nextStation:    { id: nextRs.station.id,    name: nextRs.station.name,    order: nextRs.order },
    etaMinutes,
    returning: prog.direction === -1,
    routeProgress: Math.round(prog.progress * 100),
  }
}

export const getAllBuses = async (
  filter?: string,
  routeId?: string,
  search?: string,
  page: number = 1,
  limit: number = 9
) => {
  const where: any = {}

  if (filter === 'full') {
    where.reports = {
      some: {
        occupancyLevel: 'FULL',
        timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    }
  }

  if (filter === 'active') where.status = BusStatus.ACTIVE
  if (filter === 'inactive') where.status = BusStatus.INACTIVE
  if (filter === 'maintenance') where.status = BusStatus.MAINTENANCE
  if (routeId === 'none') where.routeId = null
  else if (routeId) where.routeId = routeId

  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { plate: { contains: search, mode: 'insensitive' } },
    ]
  }

  const skip = (page - 1) * limit
  const [buses, total] = await Promise.all([
    prisma.bus.findMany({
      where,
      include: {
        route: { include: routeStationsInclude },
        reports: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.bus.count({ where }),
  ])

  return {
    data: buses.map((bus) => {
      const lastReport    = bus.reports[0] || null
      const routeStations = (bus.route as any)?.routeStations ?? []
      const { currentStation, nextStation, etaMinutes, returning, routeProgress } = computeETA(bus.id, lastReport, routeStations)
      return { ...bus, lastReport, reports: undefined, currentStation, nextStation, etaMinutes, returning, routeProgress }
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export const getBusById = async (id: string) => {
  return prisma.bus.findUnique({
    where: { id },
    include: {
      route: { include: routeStationsInclude },
      reports: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
  })
}

export const createBus = async (data: {
  code: string
  plate: string
  capacity: number
  model?: string
  routeId?: string
}) => {
  return prisma.bus.create({ data })
}

export const updateBus = async (id: string, data: {
  code?: string
  plate?: string
  capacity?: number
  model?: string
  status?: BusStatus
  routeId?: string | null
}) => {
  return prisma.bus.update({ where: { id }, data })
}

export const deleteBus = async (id: string) => {
  return prisma.bus.update({
    where: { id },
    data: { status: BusStatus.INACTIVE },
  })
}
