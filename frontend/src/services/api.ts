import axios from 'axios'
import { Bus, Report, SimulationStatus, Route } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// ─── BUSES ───────────────────────────────────────
export const getBuses = async (
  filter?: string,
  routeId?: string,
  search?: string,
  page: number = 1,
  limit: number = 9
): Promise<{ data: Bus[]; total: number; page: number; totalPages: number }> => {
  const params: Record<string, string | number> = { page, limit }
  if (filter && filter !== 'all') params.filter = filter
  if (routeId) params.routeId = routeId
  if (search) params.search = search
  const { data } = await api.get('/buses', { params })
  return data
}

export const createBus = async (bus: {
  code: string
  plate: string
  capacity: number
  model?: string
  routeId?: string
}): Promise<Bus> => {
  const { data } = await api.post('/buses', bus)
  return data.data
}

export const updateBus = async (id: string, data: {
  status?: string
  routeId?: string | null
}): Promise<Bus> => {
  const { data: res } = await api.put(`/buses/${id}`, data)
  return res.data
}

// ─── REPORTS ─────────────────────────────────────
export const getLastStatus = async (): Promise<Bus[]> => {
  const { data } = await api.get('/reports/last-status')
  return data.data
}

export const getReportsByBus = async (busId: string): Promise<Report[]> => {
  const { data } = await api.get(`/reports/bus/${busId}`)
  return data.data
}

export const createReport = async (report: {
  busId: string
  lat: number
  lng: number
  passengerCount: number
  speed?: number
}): Promise<Report> => {
  const { data } = await api.post('/reports', report)
  return data.data
}

// ─── SIMULATION ───────────────────────────────────
export const getSimulationStatus = async (): Promise<SimulationStatus> => {
  const { data } = await api.get('/simulation/status')
  return { isRunning: data.isRunning, message: data.message }
}

export const startSimulation = async (intervalSeconds = 5): Promise<void> => {
  await api.post('/simulation/start', { intervalSeconds })
}

export const stopSimulation = async (): Promise<void> => {
  await api.post('/simulation/stop')
}

// ─── LINES ───────────────────────────────────────
export const getLines = async (): Promise<Route[]> => {
  const { data } = await api.get('/lines')
  return data.data
}

export const updateLine = async (id: string, data: {
  name?: string
  active?: boolean
}): Promise<Route> => {
  const { data: res } = await api.put(`/lines/${id}`, data)
  return res.data
}
