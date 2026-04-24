import prisma from '../prisma/prisma.service'
import { getBusProgressInfo } from '../simulation/simulation.service'
import { haversineKm } from '../utils/geo'

const calculateLevel = (percent: number) => {
  if (percent <= 40) return 'LOW'
  if (percent <= 70) return 'MEDIUM'
  if (percent <= 99) return 'HIGH'
  return 'FULL'
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

export const createReport = async (data: {
  busId: string
  lat: number
  lng: number
  passengerCount: number
  speed?: number
}) => {
  const bus = await prisma.bus.findUnique({ where: { id: data.busId } })
  if (!bus) throw { status: 404, message: 'Bus not found' }

  if (data.passengerCount > bus.capacity) {
    throw {
      status: 400,
      message: `Passenger count (${data.passengerCount}) exceeds bus capacity (${bus.capacity})`,
    }
  }

  const occupancyPercent = Math.round((data.passengerCount / bus.capacity) * 100)
  const occupancyLevel   = calculateLevel(occupancyPercent) as any

  return prisma.report.create({
    data: {
      busId: data.busId,
      lat: data.lat,
      lng: data.lng,
      passengerCount: data.passengerCount,
      speed: data.speed,
      occupancyPercent,
      occupancyLevel,
    },
    include: { bus: true },
  })
}

export const getReportsByBus = async (busId: string, limit = 50, skip = 0) => {
  const [data, total] = await Promise.all([
    prisma.report.findMany({
      where: { busId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip,
    }),
    prisma.report.count({ where: { busId } }),
  ])
  return { data, total, limit, skip }
}

export const getLastStatusAllBuses = async () => {
  const buses = await prisma.bus.findMany({
    where: { status: 'ACTIVE' },
    include: {
      route: {
        include: {
          routeStations: {
            include: { station: { select: { id: true, name: true, lat: true, lng: true } } },
            orderBy: { order: 'asc' },
          },
        },
      },
      reports: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
  })

  return buses.map((bus) => {
    const lastReport    = bus.reports[0] || null
    const routeStations = (bus.route as any)?.routeStations ?? []
    const { currentStation, nextStation, etaMinutes, returning } = computeETA(bus.id, lastReport, routeStations)
    return { ...bus, lastReport, reports: undefined, currentStation, nextStation, etaMinutes, returning }
  })
}
