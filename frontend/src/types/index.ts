export interface Route {
  id: string
  name: string
  description?: string
  origin: string
  destination: string
  active: boolean
  createdAt: string
  updatedAt: string
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
}

export interface SimulationStatus {
  isRunning: boolean
  message: string
}

export type FilterType = 'all' | 'active' | 'inactive' | 'maintenance' | 'full'
