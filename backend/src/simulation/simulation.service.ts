import prisma from '../prisma/prisma.service'

let simulationInterval: NodeJS.Timeout | null = null
let isRunning = false
let isBusy    = false   // prevents concurrent ticks

// ── Waypoint cache (reloaded every 60 s, not every tick) ─────────────────────
interface Waypoint { lat: number; lng: number }
interface BusEntry { id: string; capacity: number; waypoints: Waypoint[] }

let cachedBuses: BusEntry[] = []
let cacheExpiresAt = 0
const CACHE_TTL_MS = 60_000

const loadBusCache = async () => {
  const rows = await prisma.bus.findMany({
    where: { status: 'ACTIVE', routeId: { not: null } },
    select: {
      id: true,
      capacity: true,
      route: {
        select: {
          routeStations: {
            include: { station: { select: { lat: true, lng: true } } },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  cachedBuses = rows.map((b) => ({
    id: b.id,
    capacity: b.capacity,
    waypoints: b.route?.routeStations.map((rs) => rs.station) ?? [],
  }))
  cacheExpiresAt = Date.now() + CACHE_TTL_MS
}

const getBuses = async (): Promise<BusEntry[]> => {
  if (Date.now() > cacheExpiresAt) await loadBusCache()
  return cachedBuses
}

// ── Per-bus route progress ────────────────────────────────────────────────────
interface BusProgress { stationIdx: number; progress: number; direction: 1 | -1 }
const busProgress = new Map<string, BusProgress>()

const STEP      = 0.18
const GPS_NOISE = 0.0003
const noise     = () => (Math.random() - 0.5) * GPS_NOISE
const randSpeed = () => Math.round(Math.random() * 40 + 15)
const occLevel  = (p: number) => p <= 40 ? 'LOW' : p <= 70 ? 'MEDIUM' : p <= 90 ? 'HIGH' : 'FULL'

const tickBus = async (bus: BusEntry) => {
  const { waypoints } = bus
  if (waypoints.length < 2) return

  let prog = busProgress.get(bus.id)
  if (!prog) {
    const startIdx = Math.floor(Math.random() * (waypoints.length - 1))
    prog = { stationIdx: startIdx, progress: Math.random(), direction: 1 }
    busProgress.set(bus.id, prog)
  }

  prog.progress += STEP
  while (prog.progress >= 1) {
    prog.progress -= 1
    prog.stationIdx += prog.direction
    if (prog.stationIdx >= waypoints.length - 1) { prog.stationIdx = waypoints.length - 1; prog.direction = -1 }
    else if (prog.stationIdx <= 0)               { prog.stationIdx = 0;                    prog.direction =  1 }
  }
  busProgress.set(bus.id, prog)

  const from = waypoints[prog.stationIdx]
  const toIdx = Math.max(0, Math.min(waypoints.length - 1, prog.stationIdx + prog.direction))
  const to    = waypoints[toIdx]

  const lat = from.lat + (to.lat - from.lat) * prog.progress + noise()
  const lng = from.lng + (to.lng - from.lng) * prog.progress + noise()

  const lastReport = await prisma.report.findFirst({
    where: { busId: bus.id },
    orderBy: { timestamp: 'desc' },
    select: { passengerCount: true },
  })

  const base           = lastReport?.passengerCount ?? Math.floor(bus.capacity * 0.2)
  const delta          = Math.floor((Math.random() - 0.45) * 12)
  const passengerCount = Math.min(bus.capacity, Math.max(0, base + delta))
  const occupancyPercent = Math.round((passengerCount / bus.capacity) * 100)

  try {
    await prisma.report.create({
      data: {
        busId: bus.id, lat, lng,
        speed: randSpeed(),
        passengerCount,
        occupancyPercent,
        occupancyLevel: occLevel(occupancyPercent) as any,
      },
    })
  } catch (err: any) {
    if (err?.code === 'P2003') {
      // Bus was deleted between cache reloads — purge it immediately
      cachedBuses = cachedBuses.filter(b => b.id !== bus.id)
      busProgress.delete(bus.id)
    } else {
      throw err
    }
  }
}

// ── Main tick (protected against concurrency and DB errors) ───────────────────
const runTick = async () => {
  if (isBusy) return   // skip tick if previous one is still running
  isBusy = true
  try {
    const buses = await getBuses()
    for (const bus of buses) {
      await tickBus(bus)
    }
  } catch (err: any) {
    // On connection pool errors, invalidate cache and try to reconnect
    if (err?.code === 'P2024') {
      console.warn('[simulation] DB connection pool exhausted — reconnecting...')
      cacheExpiresAt = 0
      try { await prisma.$disconnect(); await prisma.$connect() } catch { /* ignore */ }
    } else {
      console.error('[simulation] tick error:', err?.message ?? err)
    }
  } finally {
    isBusy = false
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export const startSimulation = async (intervalSeconds = 5) => {
  if (isRunning) return { message: 'Simulation already running' }

  await loadBusCache()
  if (cachedBuses.length === 0) return { message: 'No active buses with routes to simulate' }

  isRunning = true
  await runTick()   // immediate first tick

  simulationInterval = setInterval(runTick, intervalSeconds * 1000)
  return { message: `Simulation started for ${cachedBuses.length} bus(es) every ${intervalSeconds}s` }
}

export const stopSimulation = () => {
  if (!isRunning) return { message: 'No simulation running' }
  if (simulationInterval) { clearInterval(simulationInterval); simulationInterval = null }
  isRunning = false
  isBusy    = false
  busProgress.clear()
  cacheExpiresAt = 0
  return { message: 'Simulation stopped' }
}

export const getSimulationStatus = () => ({
  isRunning,
  message: isRunning ? 'Simulation running' : 'Simulation stopped',
})

export const getBusProgressInfo = (busId: string) => busProgress.get(busId) ?? null
