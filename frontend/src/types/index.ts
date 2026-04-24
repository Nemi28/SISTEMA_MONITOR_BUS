export interface Station {
  id: string
  name: string
  lat: number
  lng: number
  order?: number
  createdAt: string
}

interface RouteStation {
  order: number
  station: { id: string; name: string; lat: number; lng: number }
}

export interface Route {
  id: string
  name: string
  description?: string
  origin: string
  destination: string
  active: boolean
  createdAt: string
  updatedAt: string
  routeStations?: RouteStation[]
}

export interface Report {
  id: string
  busId: string
  lat: number
  lng: number
  passengerCount: number
  speed?: number
  occupancyPercent: number
  occupancyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL'
  timestamp: string
}

export interface Bus {
  id: string
  routeId?: string
  code: string
  plate: string
  capacity: number
  model?: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
  createdAt: string
  updatedAt: string
  route?: Route
  lastReport?: Report
  reports?: Report[]
  currentStation?: { id: string; name: string; order: number } | null
  nextStation?: { id: string; name: string; order: number } | null
  etaMinutes?: number | null
  returning?: boolean
  routeProgress?: number
}

export interface SimulationStatus {
  isRunning: boolean
  message: string
}

export type FilterType = 'all' | 'active' | 'inactive' | 'maintenance' | 'full'

export const OCCUPANCY_STYLES: Record<string, { badge: string; bar: string; label: string }> = {
  LOW:    { badge: 'bg-green-50 text-green-700',   bar: 'bg-green-500',  label: 'Disponible' },
  MEDIUM: { badge: 'bg-amber-50 text-amber-700',   bar: 'bg-amber-400',  label: 'Moderado'   },
  HIGH:   { badge: 'bg-orange-50 text-orange-700', bar: 'bg-orange-400', label: 'Casi lleno' },
  FULL:   { badge: 'bg-red-50 text-red-600',       bar: 'bg-red-500',    label: 'Lleno'      },
}

export const STATUS_STYLES: Record<string, {
  dot: string; text: string; bg: string; badge: string; label: string; iconBg: string; iconColor: string
}> = {
  ACTIVE:      { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', badge: 'bg-green-50 text-green-700 border border-green-200',  label: 'Activo',        iconBg: 'bg-blue-50',  iconColor: 'text-blue-600'  },
  INACTIVE:    { dot: 'bg-red-500',   text: 'text-red-600',   bg: 'bg-red-50',   badge: 'bg-red-50 text-red-600 border border-red-200',        label: 'Inactivo',      iconBg: 'bg-gray-100', iconColor: 'text-gray-400'  },
  MAINTENANCE: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', badge: 'bg-amber-50 text-amber-700 border border-amber-200',  label: 'Mantenimiento', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
}
