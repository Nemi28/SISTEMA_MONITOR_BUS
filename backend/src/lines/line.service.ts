import prisma from '../prisma/prisma.service'

export const getAllLines = async () => {
  return prisma.route.findMany({
    where: { active: true },
    include: { stations: { orderBy: { order: 'asc' } } },
  })
}

export const getLineById = async (id: string) => {
  return prisma.route.findUnique({
    where: { id },
    include: { stations: { orderBy: { order: 'asc' } }, buses: true },
  })
}

export const createLine = async (data: {
  name: string
  description?: string
  origin: string
  destination: string
}) => {
  return prisma.route.create({ data })
}

export const updateLine = async (id: string, data: {
  name?: string
  description?: string
  origin?: string
  destination?: string
  active?: boolean
}) => {
  return prisma.route.update({ where: { id }, data })
}

export const deleteLine = async (id: string) => {
  return prisma.route.update({ where: { id }, data: { active: false } })
}
