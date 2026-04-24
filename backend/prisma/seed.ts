import { resolve } from 'path'
import { config } from 'dotenv'
config({ path: resolve(__dirname, '../.env') })
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning database...')
  await prisma.report.deleteMany()
  await prisma.routeStation.deleteMany()
  await prisma.bus.deleteMany()
  await prisma.station.deleteMany()
  await prisma.route.deleteMany()
  console.log('✅ Database cleared')

  // ── Línea A: Metropolitano — Naranjal → Matellini ─────────────────────────
  const routeA = await prisma.route.create({
    data: {
      name: 'Línea A',
      description: 'Metropolitano · Terminal Naranjal → Terminal Matellini',
      origin: 'Terminal Naranjal',
      destination: 'Terminal Matellini',
    },
  })

  // ── Línea B: Corredor Javier Prado — La Molina → Miraflores ──────────────
  const routeB = await prisma.route.create({
    data: {
      name: 'Línea B',
      description: 'Corredor Javier Prado · Separadora Industrial → Óvalo Gutiérrez',
      origin: 'Javier Prado / Separadora Industrial',
      destination: 'Óvalo Gutiérrez / Miraflores',
    },
  })

  console.log('✅ Routes created')

  // ── Stations — coordenadas GPS verificadas (OpenStreetMap) ────────────────
  const stationsData = [
    // Línea A — Metropolitano (Norte → Sur)
    { name: 'Terminal Naranjal',                    lat: -11.9827, lng: -77.0586 },
    { name: 'Estación Independencia',               lat: -11.9985, lng: -77.0553 },
    { name: 'Estación Universitaria (UNI)',         lat: -12.0241, lng: -77.0491 },
    { name: 'Estación Caquetá',                     lat: -12.0365, lng: -77.0436 },
    { name: 'Estación Quilca',                      lat: -12.0522, lng: -77.0423 },
    { name: 'Estación Central',                     lat: -12.0577, lng: -77.0360 },
    { name: 'Estación Angamos',                     lat: -12.1133, lng: -77.0260 },
    { name: 'Estación Benavides',                   lat: -12.1249, lng: -77.0242 },
    { name: 'Estación 28 de Julio',                 lat: -12.1290, lng: -77.0229 },
    { name: 'Terminal Matellini',                   lat: -12.1783, lng: -77.0104 },
    // Línea B — Corredor Javier Prado (Este → Oeste)
    { name: 'Javier Prado / Separadora Industrial', lat: -12.0650, lng: -76.9521 },
    { name: 'Javier Prado / La Encalada',           lat: -12.0870, lng: -76.9714 },
    { name: 'Javier Prado / Aviación',              lat: -12.0882, lng: -77.0042 },
    { name: 'Javier Prado / Arequipa',              lat: -12.0944, lng: -77.0311 },
    { name: 'Óvalo Gutiérrez / Miraflores',         lat: -12.1103, lng: -77.0370 },
  ]

  const stationMap: Record<string, { id: string }> = {}
  for (const s of stationsData) {
    const created = await prisma.station.create({ data: s })
    stationMap[s.name] = created
  }
  console.log('✅ Stations created')

  // ── Assign stations to routes ─────────────────────────────────────────────
  const assignA = [
    'Terminal Naranjal', 'Estación Independencia', 'Estación Universitaria (UNI)',
    'Estación Caquetá', 'Estación Quilca', 'Estación Central',
    'Estación Angamos', 'Estación Benavides', 'Estación 28 de Julio',
    'Terminal Matellini',
  ]
  for (let i = 0; i < assignA.length; i++) {
    await prisma.routeStation.create({
      data: { routeId: routeA.id, stationId: stationMap[assignA[i]].id, order: i + 1 },
    })
  }

  const assignB = [
    'Javier Prado / Separadora Industrial', 'Javier Prado / La Encalada',
    'Javier Prado / Aviación', 'Javier Prado / Arequipa', 'Óvalo Gutiérrez / Miraflores',
  ]
  for (let i = 0; i < assignB.length; i++) {
    await prisma.routeStation.create({
      data: { routeId: routeB.id, stationId: stationMap[assignB[i]].id, order: i + 1 },
    })
  }
  console.log('✅ Stations assigned to routes')

  // ── Buses ─────────────────────────────────────────────────────────────────
  const buses = [
    { code: 'BUS-001', plate: 'ABC-001', capacity: 80,  model: 'Volvo B8R',       routeId: routeA.id },
    { code: 'BUS-002', plate: 'ABC-002', capacity: 80,  model: 'Volvo B8R',       routeId: routeA.id },
    { code: 'BUS-003', plate: 'ABC-003', capacity: 60,  model: 'Mercedes Citaro', routeId: routeA.id },
    { code: 'BUS-004', plate: 'DEF-001', capacity: 100, model: 'Scania Citywide', routeId: routeB.id },
    { code: 'BUS-005', plate: 'DEF-002', capacity: 100, model: 'Scania Citywide', routeId: routeB.id },
    { code: 'BUS-006', plate: 'DEF-003', capacity: 80,  model: 'Volvo B8R',       routeId: routeB.id },
  ]
  for (const b of buses) {
    await prisma.bus.create({ data: b })
  }
  console.log('✅ Buses created')
  console.log('🎉 Seed completed')
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
