import prisma from '../prisma/prisma.service'

export const getAllLines = async () => {
  return prisma.ruta.findMany({
    where: { activa: true },
    include: { estaciones: { orderBy: { orden: 'asc' } } },
  })
}

export const getLineById = async (id: string) => {
  return prisma.ruta.findUnique({
    where: { id },
    include: { estaciones: { orderBy: { orden: 'asc' } }, buses: true },
  })
}

export const createLine = async (data: {
  nombre: string
  descripcion?: string
  origen: string
  destino: string
}) => {
  return prisma.ruta.create({ data })
}

export const updateLine = async (id: string, data: {
  nombre?: string
  descripcion?: string
  origen?: string
  destino?: string
  activa?: boolean
}) => {
  return prisma.ruta.update({ where: { id }, data })
}

export const deleteLine = async (id: string) => {
  return prisma.ruta.update({ where: { id }, data: { activa: false } })
}