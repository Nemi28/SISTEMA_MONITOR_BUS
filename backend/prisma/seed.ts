import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // 1. Crear líneas
  const lineaA = await prisma.ruta.upsert({
    where: { nombre: 'Línea A' },
    update: {},
    create: {
      nombre: 'Línea A',
      descripcion: 'Ruta norte-sur por Av. Naranjal',
      origen: 'Terminal Naranjal',
      destino: 'Estación Central',
    },
  })

  const lineaB = await prisma.ruta.upsert({
    where: { nombre: 'Línea B' },
    update: {},
    create: {
      nombre: 'Línea B',
      descripcion: 'Ruta este-oeste por Av. Javier Prado',
      origen: 'Estación La Molina',
      destino: 'Estación Naranjal',
    },
  })

  const lineaC = await prisma.ruta.upsert({
    where: { nombre: 'Línea C' },
    update: {},
    create: {
      nombre: 'Línea C',
      descripcion: 'Ruta circular por el centro',
      origen: 'Estación Central',
      destino: 'Estación Central',
    },
  })

  console.log('✅ Líneas creadas')

  // 2. Crear estaciones
  const estacionesA = [
    { nombre: 'Terminal Naranjal', latitud: -11.9575, longitud: -77.0875, orden: 1 },
    { nombre: 'Av. Universitaria', latitud: -12.0, longitud: -77.08, orden: 2 },
    { nombre: 'Plaza Bolognesi', latitud: -12.055, longitud: -77.055, orden: 3 },
    { nombre: 'Estación Central', latitud: -12.0464, longitud: -77.0428, orden: 4 },
  ]

  for (const est of estacionesA) {
    await prisma.estacion.upsert({
      where: { rutaId_orden: { rutaId: lineaA.id, orden: est.orden } },
      update: {},
      create: { ...est, rutaId: lineaA.id },
    })
  }

  const estacionesB = [
    { nombre: 'Estación La Molina', latitud: -12.0848, longitud: -76.9455, orden: 1 },
    { nombre: 'Javier Prado Este', latitud: -12.0869, longitud: -77.0016, orden: 2 },
    { nombre: 'Javier Prado Oeste', latitud: -12.0869, longitud: -77.05, orden: 3 },
    { nombre: 'Estación Naranjal', latitud: -11.9575, longitud: -77.0875, orden: 4 },
  ]

  for (const est of estacionesB) {
    await prisma.estacion.upsert({
      where: { rutaId_orden: { rutaId: lineaB.id, orden: est.orden } },
      update: {},
      create: { ...est, rutaId: lineaB.id },
    })
  }

  console.log('✅ Estaciones creadas')

  // 3. Crear buses
  const busesData = [
    { codigo: 'BUS-001', placa: 'ABC-123', capacidad: 80, modelo: 'Volvo B8R', rutaId: lineaA.id },
    { codigo: 'BUS-002', placa: 'ABC-456', capacidad: 80, modelo: 'Volvo B8R', rutaId: lineaA.id },
    { codigo: 'BUS-003', placa: 'DEF-123', capacidad: 60, modelo: 'Mercedes Citaro', rutaId: lineaA.id },
    { codigo: 'BUS-004', placa: 'DEF-456', capacidad: 100, modelo: 'Scania Citywide', rutaId: lineaB.id },
    { codigo: 'BUS-005', placa: 'GHI-123', capacidad: 100, modelo: 'Scania Citywide', rutaId: lineaB.id },
    { codigo: 'BUS-006', placa: 'GHI-456', capacidad: 80, modelo: 'Volvo B8R', rutaId: lineaB.id },
    { codigo: 'BUS-007', placa: 'JKL-123', capacidad: 60, modelo: 'Mercedes Citaro', rutaId: lineaC.id },
    { codigo: 'BUS-008', placa: 'JKL-456', capacidad: 60, modelo: 'Mercedes Citaro', rutaId: lineaC.id },
  ]

  for (const busData of busesData) {
    await prisma.bus.upsert({
      where: { codigo: busData.codigo },
      update: {},
      create: busData,
    })
  }

  console.log('✅ Buses creados')
  console.log('🎉 Seed completado exitosamente')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })