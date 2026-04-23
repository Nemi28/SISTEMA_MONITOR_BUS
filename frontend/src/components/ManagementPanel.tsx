import { useState, useCallback, useEffect } from 'react'
import { getBuses, getLines, updateBus } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { Bus, Route } from '../types'
import { PlusCircle, Bus as BusIcon, MapPin, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import BusForm from './BusForm'
import LineForm from './LineForm'

interface Props {
  showToast: (message: string, type?: 'success' | 'error') => void
}

export default function ManagementPanel({ showToast }: Props) {
  const [showBusForm, setShowBusForm] = useState(false)
  const [showLineForm, setShowLineForm] = useState(false)
  const [activeSection, setActiveSection] = useState<'buses' | 'lines'>('buses')
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [routeId, setRouteId] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchLines = useCallback(() => getLines(), [])
  const { data: lines, refetch: refetchLines } = usePolling(fetchLines, 30000)

  const fetchBuses = useCallback(
    () => getBuses(undefined, routeId, searchDebounced, page, 5),
    [routeId, searchDebounced, page]
  )
  const { data: busResult, refetch: refetchBuses } = usePolling(fetchBuses, 10000)

  const buses = busResult?.data ?? []
  const totalPages = busResult?.totalPages ?? 1
  const total = busResult?.total ?? 0

  const handleStatusChange = async (busId: string, status: string) => {
    try {
      await updateBus(busId, { status })
      refetchBuses()
      showToast('Estado actualizado correctamente', 'success')
    } catch {
      showToast('Error al actualizar estado', 'error')
    }
  }

  const handleRouteChange = async (busId: string, newRouteId: string) => {
    try {
      await updateBus(busId, { routeId: newRouteId || null })
      refetchBuses()
      showToast('Línea actualizada correctamente', 'success')
    } catch {
      showToast('Error al actualizar línea', 'error')
    }
  }

  const handleRouteFilter = (id: string) => {
    setRouteId(id)
    setPage(1)
  }

  const statusColors = {
    ACTIVE: 'text-green-400',
    INACTIVE: 'text-red-400',
    MAINTENANCE: 'text-yellow-400',
  }

  const statusBg = {
    ACTIVE: 'bg-green-400/10 border-green-400/20',
    INACTIVE: 'bg-red-400/10 border-red-400/20',
    MAINTENANCE: 'bg-yellow-400/10 border-yellow-400/20',
  }

  const statusLabels = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    MAINTENANCE: 'Mantenimiento',
  }

  return (
    <div>
      {/* Section tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveSection('buses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'buses'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <BusIcon size={16} />
          Buses ({total})
        </button>
        <button
          onClick={() => setActiveSection('lines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'lines'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <MapPin size={16} />
          Líneas ({lines?.length ?? 0})
        </button>
      </div>

      {/* Buses section */}
      {activeSection === 'buses' && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">Gestión de Buses</h2>
            <button
              onClick={() => setShowBusForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle size={16} />
              Nuevo Bus
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código o placa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-700 text-white text-sm rounded-lg pl-8 pr-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
              />
            </div>

            <select
              value={routeId}
              onChange={(e) => handleRouteFilter(e.target.value)}
              className="bg-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="">Todas las líneas</option>
              <option value="none">Sin línea</option>
              {lines?.map((line: Route) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>

            <span className="text-gray-500 text-sm self-center ml-auto">
              {total} bus{total !== 1 ? 'es' : ''} en total
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Placa</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Modelo</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Capacidad</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Línea actual</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Cambiar estado</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Cambiar línea</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {buses.map((bus: Bus) => (
                  <tr key={bus.id} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{bus.code}</td>
                    <td className="px-4 py-3 text-gray-300">{bus.plate}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{bus.model ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{bus.capacity}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {bus.route?.name ?? 'Sin línea'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${statusBg[bus.status]} ${statusColors[bus.status]}`}>
                        {statusLabels[bus.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={bus.status}
                        onChange={(e) => handleStatusChange(bus.id, e.target.value)}
                        className="bg-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 border border-gray-600 focus:outline-none"
                      >
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        <option value="MAINTENANCE">Mantenimiento</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <select
                        value={bus.routeId ?? ''}
                        onChange={(e) => handleRouteChange(bus.id, e.target.value)}
                        className="bg-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 border border-gray-600 focus:outline-none"
                      >
                        <option value="">Sin línea</option>
                        {lines?.map((line: Route) => (
                          <option key={line.id} value={line.id}>
                            {line.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {buses.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BusIcon className="mx-auto mb-3 text-gray-700" size={40} />
                <p>{search ? 'No se encontraron buses con ese criterio' : 'No hay buses registrados'}</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
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
        </div>
      )}

      {/* Lines section */}
      {activeSection === 'lines' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Gestión de Líneas</h2>
            <button
              onClick={() => setShowLineForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle size={16} />
              Nueva Línea
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lines?.map((line: Route) => (
              <div key={line.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white">{line.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${line.active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                    {line.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                {line.description && (
                  <p className="text-gray-500 text-xs mb-3">{line.description}</p>
                )}
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <MapPin size={12} />
                  <span>{line.origin} → {line.destination}</span>
                </div>
              </div>
            ))}

            {lines?.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <MapPin className="mx-auto mb-3 text-gray-700" size={40} />
                <p>No hay líneas registradas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showBusForm && (
        <BusForm
          onClose={() => setShowBusForm(false)}
          onSuccess={() => { refetchBuses(); showToast('Bus registrado exitosamente', 'success') }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
      {showLineForm && (
        <LineForm
          onClose={() => setShowLineForm(false)}
          onSuccess={() => { refetchLines(); showToast('Línea creada exitosamente', 'success') }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
    </div>
  )
}
