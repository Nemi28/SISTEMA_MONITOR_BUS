export interface Ruta {
  id: string
  nombre: string
  descripcion?: string
  origen: string
  destino: string
  activa: boolean
  createdAt: string
  updatedAt: string
}

export interface Reporte {
  id: string
  busId: string
  latitud: number
  longitud: number
  cantidadPasajeros: number
  velocidad?: number
  porcentajeOcupacion: number
  nivelOcupacion: 'BAJO' | 'MEDIO' | 'ALTO' | 'LLENO'
  timestamp: string
}

export interface Bus {
  id: string
  rutaId?: string
  codigo: string
  placa: string
  capacidad: number
  modelo?: string
  estado: 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO'
  createdAt: string
  updatedAt: string
  ruta?: Ruta
  ultimoReporte?: Reporte
  reportes?: Reporte[]
}

export interface SimulationStatus {
  isRunning: boolean
  message: string
}

export type FilterType = 'all' | 'active' | 'full'