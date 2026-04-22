import prisma from '../prisma/prisma.service'
import { BusEstado } from '@prisma/client'

export const getAllBuses = async (filter?: string) => {
  const where: any = {}

  if (filter === 'full') {
    where.reportes = {
      some: {
        nivelOcupacion: 'LLENO',
        timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // últimos 5 min
        },
      },
    }
  }

  if (filter === 'active') {
    where.estado = BusEstado.ACTIVO
  }

  return prisma.bus.findMany({
    where,
    include: {
      ruta: true,
      reportes: {
        orderBy: { timestamp: 'desc' },
        take: 1, // solo el último reporte
      },
    },
  })
}

export const getBusById = async (id: string) => {
  return prisma.bus.findUnique({
    where: { id },
    include: {
      ruta: true,
      reportes: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  })
}

export const createBus = async (data: {
  codigo: string
  placa: string
  capacidad: number
  modelo?: string
  rutaId?: string
}) => {
  return prisma.bus.create({ data })
}

export const updateBus = async (id: string, data: {
  codigo?: string
  placa?: string
  capacidad?: number
  modelo?: string
  estado?: BusEstado
  rutaId?: string
}) => {
  return prisma.bus.update({ where: { id }, data })
}

export const deleteBus = async (id: string) => {
  return prisma.bus.update({
    where: { id },
    data: { estado: BusEstado.INACTIVO },
  })
}