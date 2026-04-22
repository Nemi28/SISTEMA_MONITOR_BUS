import { useState, useCallback } from 'react'
import { Bus, FilterType } from '../types'
import { getBuses } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { AlertCircle, Bus as BusIcon } from 'lucide-react'
import BusCard from './BusCard'

interface Props {
  onSelectBus: (bus: Bus) => void
}

const filters: { label: string; value: FilterType }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Llenos', value: 'full' },
]

export default function BusList({ onSelectBus }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')

  const fetchBuses = useCallback(() => getBuses(filter), [filter])
  const { data: buses, loading, error } = usePolling(fetchBuses, 5000)

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse h-40" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
          <p className="text-red-400 text-lg">Error al cargar buses</p>
          <p className="text-gray-500 text-sm mt-1">Verifica que el servidor esté corriendo</p>
        </div>
      )}

      {/* Sin datos */}
      {!loading && !error && buses?.length === 0 && (
        <div className="text-center py-12">
          <BusIcon className="mx-auto mb-3 text-gray-600" size={40} />
          <p className="text-gray-400 text-lg">No hay buses registrados</p>
          <p className="text-gray-500 text-sm mt-1">
            {filter !== 'all' ? 'Prueba con otro filtro' : 'Agrega un bus para comenzar'}
          </p>
        </div>
      )}

      {/* Con datos */}
      {!loading && !error && buses && buses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses.map((bus) => (
            <BusCard key={bus.id} bus={bus} onClick={onSelectBus} />
          ))}
        </div>
      )}
    </div>
  )
}