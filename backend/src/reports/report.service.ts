import prisma from '../prisma/prisma.service'

const calculateLevel = (percent: number) => {
  if (percent <= 40) return 'LOW'
  if (percent <= 70) return 'MEDIUM'
  if (percent <= 99) return 'HIGH'
  return 'FULL'
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
  const occupancyLevel = calculateLevel(occupancyPercent) as any

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

export const getReportsByBus = async (busId: string) => {
  return prisma.report.findMany({
    where: { busId },
    orderBy: { timestamp: 'desc' },
  })
}

export const getLastStatusAllBuses = async () => {
  const buses = await prisma.bus.findMany({
    where: { status: 'ACTIVE' },
    include: {
      route: true,
      reports: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  })

  return buses.map((bus) => ({
    ...bus,
    lastReport: bus.reports[0] || null,
    reports: undefined,
  }))
}
