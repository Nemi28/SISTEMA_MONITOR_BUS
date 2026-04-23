import { Bus } from '../types'
import { MapPin, Gauge, Circle } from 'lucide-react'

interface Props {
  bus: Bus
  onClick: (bus: Bus) => void
}

const levelColors = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  FULL: 'bg-red-500',
}

const levelLabels = {
  LOW: 'Disponible',
  MEDIUM: 'Moderado',
  HIGH: 'Casi lleno',
  FULL: 'Lleno',
}

const statusColors = {
  ACTIVE: 'text-green-400',
  INACTIVE: 'text-red-400',
  MAINTENANCE: 'text-yellow-400',
}

const statusLabels = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  MAINTENANCE: 'Mantenimiento',
}

export default function BusCard({ bus, onClick }: Props) {
  const report = bus.lastReport
  const percent = report?.occupancyPercent ?? 0
  const level = report?.occupancyLevel ?? 'LOW'

  return (
    <div
      onClick={() => onClick(bus)}
      className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-500"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-white text-lg">{bus.code}</h3>
          <p className="text-gray-400 text-sm">{bus.plate}</p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium ${statusColors[bus.status]}`}>
          <Circle size={8} fill="currentColor" />
          {statusLabels[bus.status]}
        </span>
      </div>

      {/* Route */}
      {bus.route && (
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <MapPin size={12} />
          <span>{bus.route.name} — {bus.route.origin} → {bus.route.destination}</span>
        </div>
      )}

      {/* Occupancy */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Ocupación</span>
          <span className="font-medium text-white">{percent}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${levelColors[level]}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Level badge */}
      <div className="flex justify-between items-center mt-3">
        <span className={`text-xs px-2 py-1 rounded-full text-white ${levelColors[level]}`}>
          {levelLabels[level]}
        </span>
        {report && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Gauge size={12} />
            {report.speed ? `${report.speed} km/h` : 'Sin velocidad'}
          </span>
        )}
      </div>

      {/* No report */}
      {!report && (
        <p className="text-gray-500 text-xs mt-2">Sin reportes aún</p>
      )}
    </div>
  )
}
