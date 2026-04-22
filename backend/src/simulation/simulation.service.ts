import prisma from '../prisma/prisma.service'

// Coordenadas base de Lima para la simulación
const BASE_LAT = -12.0464
const BASE_LNG = -77.0428

let simulationInterval: NodeJS.Timeout | null = null
let isRunning = false

const getRandomOffset = () => (Math.random() - 0.5) * 0.05
const getRandomSpeed = () => Math.round(Math.random() * 60 + 10) // 10-70 km/h

const calcularNivel = (porcentaje: number) => {
  if (porcentaje <= 40) return 'BAJO'
  if (porcentaje <= 70) return 'MEDIO'
  if (porcentaje <= 99) return 'ALTO'
  return 'LLENO'
}

const generateReportForBus = async (bus: any) => {
  // Obtener último reporte para simular movimiento continuo
  const lastReport = await prisma.reporte.findFirst({
    where: { busId: bus.id },
    orderBy: { timestamp: 'desc' },
  })

  const latitud = lastReport
    ? lastReport.latitud + getRandomOffset() * 0.3
    : BASE_LAT + getRandomOffset()

  const longitud = lastReport
    ? lastReport.longitud + getRandomOffset() * 0.3
    : BASE_LNG + getRandomOffset()

  // Pasajeros varían gradualmente
  const lastPasajeros = lastReport?.cantidadPasajeros ?? Math.floor(bus.capacidad * 0.3)
  const variacion = Math.floor((Math.random() - 0.5) * 15)
  const cantidadPasajeros = Math.min(
    bus.capacidad,
    Math.max(0, lastPasajeros + variacion)
  )

  const porcentajeOcupacion = Math.round((cantidadPasajeros / bus.capacidad) * 100)
  const nivelOcupacion = calcularNivel(porcentajeOcupacion) as any

  await prisma.reporte.create({
    data: {
      busId: bus.id,
      latitud,
      longitud,
      cantidadPasajeros,
      velocidad: getRandomSpeed(),
      porcentajeOcupacion,
      nivelOcupacion,
    },
  })
}

export const startSimulation = async (intervalSeconds: number = 5) => {
  if (isRunning) {
    return { message: 'La simulación ya está en curso' }
  }

  const buses = await prisma.bus.findMany({ where: { estado: 'ACTIVO' } })

  if (buses.length === 0) {
    return { message: 'No hay buses activos para simular' }
  }

  isRunning = true

  // Genera primer reporte inmediatamente
  for (const bus of buses) {
    await generateReportForBus(bus)
  }

  simulationInterval = setInterval(async () => {
    const activeBuses = await prisma.bus.findMany({ where: { estado: 'ACTIVO' } })
    for (const bus of activeBuses) {
      await generateReportForBus(bus)
    }
  }, intervalSeconds * 1000)

  return {
    message: `Simulación iniciada para ${buses.length} bus(es) cada ${intervalSeconds} segundos`,
  }
}

export const stopSimulation = () => {
  if (!isRunning) {
    return { message: 'No hay simulación en curso' }
  }

  if (simulationInterval) {
    clearInterval(simulationInterval)
    simulationInterval = null
  }

  isRunning = false
  return { message: 'Simulación detenida' }
}

export const getSimulationStatus = () => ({
  isRunning,
  message: isRunning ? 'Simulación en curso' : 'Simulación detenida',
})