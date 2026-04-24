import { useState, useCallback } from 'react'
import { Bus, FilterType, Route } from '../types'
import { getBuses, getLines } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { AlertCircle, Bus as BusIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import BusCard from './BusCard'

interface Props { onSelectBus: (bus: Bus) => void }

const filterOptions: { label: string; value: FilterType }[] = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Activo',            value: 'active' },
  { label: 'Inactivo',          value: 'inactive' },
  { label: 'Mantenimiento',     value: 'maintenance' },
  { label: 'Llenos',            value: 'full' },
]

const selectCls = "bg-white text-gray-700 text-sm rounded-lg px-3 py-1.5 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"

export default function BusList({ onSelectBus }: Props) {
  const [filter, setFilter]   = useState<FilterType>('all')
  const [routeId, setRouteId] = useState('')
  const [page, setPage]       = useState(1)

  const fetchLines = useCallback(() => getLines(), [])
  const { data: lines } = usePolling(fetchLines, 30000)

  const fetchBuses = useCallback(() => getBuses(filter, routeId, '', page), [filter, routeId, page])
  const { data: result, loading, error } = usePolling(fetchBuses, 5000)

  const buses      = result?.data ?? []
  const totalPages = result?.totalPages ?? 1
  const total      = result?.total ?? 0

  const handleFilter = (f: FilterType) => { setFilter(f); setPage(1) }
  const handleRoute  = (id: string)    => { setRouteId(id); setPage(1) }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={filter} onChange={e => handleFilter(e.target.value as FilterType)} className={selectCls}>
          {filterOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={routeId} onChange={e => handleRoute(e.target.value)} className={selectCls}>
          <option value="">Todas las líneas</option>
          {lines?.map((l: Route) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-400">{total} bus{total !== 1 ? 'es' : ''}</span>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-28 animate-pulse" />)}
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto mb-3 text-red-400" size={36} />
          <p className="text-red-500 font-medium text-sm">Error al cargar buses</p>
          <p className="text-gray-400 text-sm mt-1">Verifica que el servidor esté corriendo</p>
        </div>
      )}

      {!loading && !error && buses.length === 0 && (
        <div className="text-center py-12">
          <BusIcon className="mx-auto mb-3 text-gray-300" size={36} />
          <p className="text-gray-500 font-medium text-sm">No hay buses registrados</p>
          <p className="text-gray-400 text-sm mt-1">{filter !== 'all' || routeId ? 'Prueba con otro filtro' : 'Agrega un bus para comenzar'}</p>
        </div>
      )}

      {!loading && !error && buses.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {buses.map((bus: Bus) => <BusCard key={bus.id} bus={bus} onClick={onSelectBus} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-500">
                Página <span className="text-gray-800 font-semibold">{page}</span> de <span className="text-gray-800 font-semibold">{totalPages}</span>
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
