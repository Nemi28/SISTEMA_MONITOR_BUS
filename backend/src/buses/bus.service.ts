import prisma from '../prisma/prisma.service'
import { BusStatus } from '@prisma/client'

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
        route: true,
        reports: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.bus.count({ where }),
  ])

  return {
    data: buses.map((bus) => ({
      ...bus,
      lastReport: bus.reports[0] || null,
      reports: undefined,
    })),
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
      route: true,
      reports: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
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
