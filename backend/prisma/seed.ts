import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // 1. Create routes
  const routeA = await prisma.route.upsert({
    where: { name: 'Línea A' },
    update: {},
    create: {
      name: 'Línea A',
      description: 'Ruta norte-sur por Av. Naranjal',
      origin: 'Terminal Naranjal',
      destination: 'Estación Central',
    },
  })

  const routeB = await prisma.route.upsert({
    where: { name: 'Línea B' },
    update: {},
    create: {
      name: 'Línea B',
      description: 'Ruta este-oeste por Av. Javier Prado',
      origin: 'Estación La Molina',
      destination: 'Estación Naranjal',
    },
  })

  const routeC = await prisma.route.upsert({
    where: { name: 'Línea C' },
    update: {},
    create: {
      name: 'Línea C',
      description: 'Ruta circular por el centro',
      origin: 'Estación Central',
      destination: 'Estación Central',
    },
  })

  console.log('✅ Routes created')

  // 2. Create stations
  const stationsA = [
    { name: 'Terminal Naranjal', lat: -11.9575, lng: -77.0875, order: 1 },
    { name: 'Av. Universitaria', lat: -12.0, lng: -77.08, order: 2 },
    { name: 'Plaza Bolognesi', lat: -12.055, lng: -77.055, order: 3 },
    { name: 'Estación Central', lat: -12.0464, lng: -77.0428, order: 4 },
  ]

  for (const st of stationsA) {
    await prisma.station.upsert({
      where: { routeId_order: { routeId: routeA.id, order: st.order } },
      update: {},
      create: { ...st, routeId: routeA.id },
    })
  }

  const stationsB = [
    { name: 'Estación La Molina', lat: -12.0848, lng: -76.9455, order: 1 },
    { name: 'Javier Prado Este', lat: -12.0869, lng: -77.0016, order: 2 },
    { name: 'Javier Prado Oeste', lat: -12.0869, lng: -77.05, order: 3 },
    { name: 'Estación Naranjal', lat: -11.9575, lng: -77.0875, order: 4 },
  ]

  for (const st of stationsB) {
    await prisma.station.upsert({
      where: { routeId_order: { routeId: routeB.id, order: st.order } },
      update: {},
      create: { ...st, routeId: routeB.id },
    })
  }

  console.log('✅ Stations created')

  // 3. Create buses
  const busesData = [
    { code: 'BUS-001', plate: 'ABC-123', capacity: 80, model: 'Volvo B8R', routeId: routeA.id },
    { code: 'BUS-002', plate: 'ABC-456', capacity: 80, model: 'Volvo B8R', routeId: routeA.id },
    { code: 'BUS-003', plate: 'DEF-123', capacity: 60, model: 'Mercedes Citaro', routeId: routeA.id },
    { code: 'BUS-004', plate: 'DEF-456', capacity: 100, model: 'Scania Citywide', routeId: routeB.id },
    { code: 'BUS-005', plate: 'GHI-123', capacity: 100, model: 'Scania Citywide', routeId: routeB.id },
    { code: 'BUS-006', plate: 'GHI-456', capacity: 80, model: 'Volvo B8R', routeId: routeB.id },
    { code: 'BUS-007', plate: 'JKL-123', capacity: 60, model: 'Mercedes Citaro', routeId: routeC.id },
    { code: 'BUS-008', plate: 'JKL-456', capacity: 60, model: 'Mercedes Citaro', routeId: routeC.id },
  ]

  for (const busData of busesData) {
    await prisma.bus.upsert({
      where: { code: busData.code },
      update: {},
      create: busData,
    })
  }

  console.log('✅ Buses created')
  console.log('🎉 Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
