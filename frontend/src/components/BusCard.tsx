import { Bus } from '../types'
import { MapPin, Gauge, Circle } from 'lucide-react'

interface Props {
  bus: Bus
  onClick: (bus: Bus) => void
}

const nivelColors = {
  BAJO: 'bg-green-500',
  MEDIO: 'bg-yellow-500',
  ALTO: 'bg-orange-500',
  LLENO: 'bg-red-500',
}

const nivelLabels = {
  BAJO: 'Disponible',
  MEDIO: 'Moderado',
  ALTO: 'Casi lleno',
  LLENO: 'Lleno',
}

const estadoColors = {
  ACTIVO: 'text-green-400',
  INACTIVO: 'text-red-400',
  MANTENIMIENTO: 'text-yellow-400',
}

export default function BusCard({ bus, onClick }: Props) {
  const reporte = bus.ultimoReporte
  const porcentaje = reporte?.porcentajeOcupacion ?? 0
  const nivel = reporte?.nivelOcupacion ?? 'BAJO'

  return (
    <div
      onClick={() => onClick(bus)}
      className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-500"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-white text-lg">{bus.codigo}</h3>
          <p className="text-gray-400 text-sm">{bus.placa}</p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium ${estadoColors[bus.estado]}`}>
          <Circle size={8} fill="currentColor" />
          {bus.estado}
        </span>
      </div>

      {/* Ruta */}
      {bus.ruta && (
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <MapPin size={12} />
          <span>{bus.ruta.nombre} — {bus.ruta.origen} → {bus.ruta.destino}</span>
        </div>
      )}

      {/* Ocupación */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Ocupación</span>
          <span className="font-medium text-white">{porcentaje}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${nivelColors[nivel]}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Badge nivel */}
      <div className="flex justify-between items-center mt-3">
        <span className={`text-xs px-2 py-1 rounded-full text-white ${nivelColors[nivel]}`}>
          {nivelLabels[nivel]}
        </span>
        {reporte && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Gauge size={12} />
            {reporte.velocidad ? `${reporte.velocidad} km/h` : 'Sin velocidad'}
          </span>
        )}
      </div>

      {/* Sin reporte */}
      {!reporte && (
        <p className="text-gray-500 text-xs mt-2">Sin reportes aún</p>
      )}
    </div>
  )
}