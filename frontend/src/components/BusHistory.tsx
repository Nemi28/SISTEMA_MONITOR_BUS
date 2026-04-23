import { useEffect, useState } from 'react'
import { Report } from '../types'
import { getReportsByBus } from '../services/api'
import { X, Clock, Users, Gauge, MapPin } from 'lucide-react'

interface Props {
  busId: string
  busCode: string
  onClose: () => void
}

const levelColors = {
  LOW: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-orange-400',
  FULL: 'text-red-400',
}

export default function BusHistory({ busId, busCode, onClose }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReportsByBus(busId)
      .then(setReports)
      .finally(() => setLoading(false))
  }, [busId])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl border border-gray-700 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Historial — {busCode}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex-1 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg h-16 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Clock className="text-gray-600 mb-3" size={40} />
            <p className="text-gray-400">Sin reportes registrados</p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {reports.map((r) => (
              <div key={r.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${levelColors[r.occupancyLevel]}`}>
                    {r.occupancyLevel} — {r.occupancyPercent}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(r.timestamp).toLocaleString('es-PE')}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {r.passengerCount} pasajeros
                  </span>
                  {r.speed && (
                    <span className="flex items-center gap-1">
                      <Gauge size={12} />
                      {r.speed} km/h
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
