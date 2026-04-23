import { useState, useCallback } from 'react'
import { Bus, FilterType, Route } from '../types'
import { getBuses, getLines } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { AlertCircle, Bus as BusIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import BusCard from './BusCard'

interface Props {
  onSelectBus: (bus: Bus) => void
}

const filterOptions: { label: string; value: FilterType }[] = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Mantenimiento', value: 'maintenance' },
  { label: 'Llenos (ocupación)', value: 'full' },
]

export default function BusList({ onSelectBus }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [routeId, setRouteId] = useState<string>('')
  const [page, setPage] = useState(1)

  const fetchLines = useCallback(() => getLines(), [])
  const { data: lines } = usePolling(fetchLines, 30000)

  const fetchBuses = useCallback(
    () => getBuses(filter, routeId, '', page),
    [filter, routeId, page]
  )
  const { data: result, loading, error } = usePolling(fetchBuses, 5000)

  const buses = result?.data ?? []
  const totalPages = result?.totalPages ?? 1
  const total = result?.total ?? 0

  const handleFilterChange = (f: FilterType) => {
    setFilter(f)
    setPage(1)
  }

  const handleRouteChange = (id: string) => {
    setRouteId(id)
    setPage(1)
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value as FilterType)}
          className="bg-gray-700 text-gray-300 text-sm rounded-full px-4 py-1.5 border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          {filterOptions.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <select
          value={routeId}
          onChange={(e) => handleRouteChange(e.target.value)}
          className="bg-gray-700 text-gray-300 text-sm rounded-full px-4 py-1.5 border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas las líneas</option>
          {lines?.map((line: Route) => (
            <option key={line.id} value={line.id}>
              {line.name}
            </option>
          ))}
        </select>

        <span className="ml-auto text-gray-500 text-sm self-center">
          {total} bus{total !== 1 ? 'es' : ''}
        </span>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse h-40" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
          <p className="text-red-400 text-lg">Error al cargar buses</p>
          <p className="text-gray-500 text-sm mt-1">Verifica que el servidor esté corriendo</p>
        </div>
      )}

      {!loading && !error && buses.length === 0 && (
        <div className="text-center py-12">
          <BusIcon className="mx-auto mb-3 text-gray-600" size={40} />
          <p className="text-gray-400 text-lg">No hay buses registrados</p>
          <p className="text-gray-500 text-sm mt-1">
            {filter !== 'all' || routeId ? 'Prueba con otro filtro' : 'Agrega un bus para comenzar'}
          </p>
        </div>
      )}

      {!loading && !error && buses.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map((bus: Bus) => (
              <BusCard key={bus.id} bus={bus} onClick={onSelectBus} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-400">
                Página <span className="text-white font-medium">{page}</span> de{' '}
                <span className="text-white font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
