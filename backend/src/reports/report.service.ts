import prisma from '../prisma/prisma.service'

const calcularNivel = (porcentaje: number) => {
  if (porcentaje <= 40) return 'BAJO'
  if (porcentaje <= 70) return 'MEDIO'
  if (porcentaje <= 99) return 'ALTO'
  return 'LLENO'
}

export const createReport = async (data: {
  busId: string
  latitud: number
  longitud: number
  cantidadPasajeros: number
  velocidad?: number
}) => {
  // 1. Buscar el bus y validar que existe
  const bus = await prisma.bus.findUnique({ where: { id: data.busId } })
  if (!bus) throw { status: 404, message: 'Bus no encontrado' }

  // 2. Validar que no exceda la capacidad
  if (data.cantidadPasajeros > bus.capacidad) {
    throw {
      status: 400,
      message: `La cantidad de pasajeros (${data.cantidadPasajeros}) excede la capacidad del bus (${bus.capacidad})`,
    }
  }

  // 3. Calcular ocupación automáticamente
  const porcentajeOcupacion = Math.round((data.cantidadPasajeros / bus.capacidad) * 100)
  const nivelOcupacion = calcularNivel(porcentajeOcupacion) as any

  // 4. Crear reporte — nunca se sobrescribe, siempre INSERT
  return prisma.reporte.create({
    data: {
      busId: data.busId,
      latitud: data.latitud,
      longitud: data.longitud,
      cantidadPasajeros: data.cantidadPasajeros,
      velocidad: data.velocidad,
      porcentajeOcupacion,
      nivelOcupacion,
    },
    include: { bus: true },
  })
}

export const getReportsByBus = async (busId: string) => {
  return prisma.reporte.findMany({
    where: { busId },
    orderBy: { timestamp: 'desc' },
  })
}

export const getLastStatusAllBuses = async () => {
  const buses = await prisma.bus.findMany({
    where: { estado: 'ACTIVO' },
    include: {
      ruta: true,
      reportes: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  })

  return buses.map((bus) => ({
    ...bus,
    ultimoReporte: bus.reportes[0] || null,
    reportes: undefined,
  }))
}