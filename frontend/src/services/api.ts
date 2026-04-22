import axios from 'axios'
import { Bus, Reporte, SimulationStatus } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// ─── BUSES ───────────────────────────────────────
export const getBuses = async (filter?: string): Promise<Bus[]> => {
  const params = filter && filter !== 'all' ? { filter } : {}
  const { data } = await api.get('/buses', { params })
  return data.data
}

export const createBus = async (bus: {
  codigo: string
  placa: string
  capacidad: number
  modelo?: string
  rutaId?: string
}): Promise<Bus> => {
  const { data } = await api.post('/buses', bus)
  return data.data
}

// ─── REPORTS ─────────────────────────────────────
export const getLastStatus = async (): Promise<Bus[]> => {
  const { data } = await api.get('/reports/last-status')
  return data.data
}

export const getReportsByBus = async (busId: string): Promise<Reporte[]> => {
  const { data } = await api.get(`/reports/bus/${busId}`)
  return data.data
}

export const createReport = async (report: {
  busId: string
  latitud: number
  longitud: number
  cantidadPasajeros: number
  velocidad?: number
}): Promise<Reporte> => {
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
export const getLines = async () => {
  const { data } = await api.get('/lines')
  return data.data
}