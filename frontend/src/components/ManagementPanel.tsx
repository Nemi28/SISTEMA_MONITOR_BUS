import { useState, useCallback, useEffect } from 'react'
import { getBuses, getLines, updateBus, updateLine } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { Bus, Route, STATUS_STYLES } from '../types'
import { PlusCircle, Bus as BusIcon, MapPin, ChevronLeft, ChevronRight, Search, Pencil, Check, X } from 'lucide-react'
import BusForm from './BusForm'
import LineForm from './LineForm'
import StationManager from './StationManager'

interface Props { showToast: (message: string, type?: 'success' | 'error') => void }

const inputCls  = "w-full bg-white text-gray-900 text-sm rounded-lg px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
const selectCls = "bg-white text-gray-700 text-xs rounded-md px-2 py-1.5 border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors"

export default function ManagementPanel({ showToast }: Props) {
  const [showBusForm, setShowBusForm]               = useState(false)
  const [showLineForm, setShowLineForm]             = useState(false)
  const [managingStationsFor, setManagingStationsFor] = useState<Route | null>(null)
  const [editingLineId, setEditingLineId]           = useState<string | null>(null)
  const [editLineForm, setEditLineForm]             = useState({ name: '', description: '' })
  const [savingLine, setSavingLine]                 = useState(false)
  const [activeSection, setActiveSection]           = useState<'buses' | 'lines'>('buses')
  const [search, setSearch]                         = useState('')
  const [searchDebounced, setSearchDebounced]       = useState('')
  const [routeId, setRouteId]                       = useState('')
  const [page, setPage]                             = useState(1)

  useEffect(() => {
    const t = setTimeout(() => { setSearchDebounced(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchLines = useCallback(() => getLines(), [])
  const { data: lines, refetch: refetchLines } = usePolling(fetchLines, 30000)

  const fetchBuses = useCallback(() => getBuses(undefined, routeId, searchDebounced, page, 5), [routeId, searchDebounced, page])
  const { data: busResult, refetch: refetchBuses } = usePolling(fetchBuses, 10000)

  const buses      = busResult?.data ?? []
  const totalPages = busResult?.totalPages ?? 1
  const total      = busResult?.total ?? 0

  const handleStatusChange = async (busId: string, status: string) => {
    try { await updateBus(busId, { status }); refetchBuses(); showToast('Estado actualizado', 'success') }
    catch { showToast('Error al actualizar estado', 'error') }
  }
  const handleRouteChange = async (busId: string, newRouteId: string) => {
    try { await updateBus(busId, { routeId: newRouteId || null }); refetchBuses(); showToast('Línea actualizada', 'success') }
    catch { showToast('Error al actualizar línea', 'error') }
  }
  const handleStartEditLine = (line: Route) => { setEditingLineId(line.id); setEditLineForm({ name: line.name, description: line.description ?? '' }) }
  const handleSaveEditLine  = async (line: Route) => {
    setSavingLine(true)
    try { await updateLine(line.id, editLineForm); setEditingLineId(null); refetchLines(); showToast('Línea actualizada', 'success') }
    catch { showToast('Error al actualizar línea', 'error') }
    finally { setSavingLine(false) }
  }
  const getLineEndpoints = (line: Route) => {
    const s = line.routeStations ?? []
    return s.length ? { origin: s[0].station.name, destination: s[s.length-1].station.name } : { origin: line.origin, destination: line.destination }
  }


  return (
    <div>
      {/* Section tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setActiveSection('buses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeSection==='buses' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
          <BusIcon size={14} /> Buses ({total})
        </button>
        <button onClick={() => setActiveSection('lines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeSection==='lines' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
          <MapPin size={14} /> Líneas ({lines?.length ?? 0})
        </button>
      </div>

      {/* Buses */}
      {activeSection === 'buses' && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Gestión de Buses</h2>
            <button onClick={() => setShowBusForm(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <PlusCircle size={14} /> Nuevo Bus
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar por código o placa..." value={search} onChange={e => setSearch(e.target.value)} className={`${inputCls} pl-8 w-60`} />
            </div>
            <select value={routeId} onChange={e => { setRouteId(e.target.value); setPage(1) }} className={`${selectCls} text-sm py-2`}>
              <option value="">Todas las líneas</option>
              <option value="none">Sin línea</option>
              {lines?.map((l: Route) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <span className="text-sm text-gray-400 self-center ml-auto">{total} buses en total</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Placa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Modelo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Cap.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Línea</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cambiar estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Cambiar línea</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {buses.map((bus: Bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{bus.code}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{bus.plate}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{bus.model ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{bus.capacity}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{bus.route?.name ?? <span className="text-gray-300 italic">Sin línea</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[bus.status].badge}`}>{STATUS_STYLES[bus.status].label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={bus.status} onChange={e => handleStatusChange(bus.id, e.target.value)} className={selectCls}>
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        <option value="MAINTENANCE">Mantenimiento</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <select value={bus.routeId ?? ''} onChange={e => handleRouteChange(bus.id, e.target.value)} className={selectCls}>
                        <option value="">Sin línea</option>
                        {lines?.map((l: Route) => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {buses.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <BusIcon className="mx-auto mb-3 text-gray-300" size={32} />
                <p className="text-sm">{search ? 'No se encontraron buses' : 'No hay buses registrados'}</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"><ChevronLeft size={16}/></button>
              <span className="text-sm text-gray-500">Página <span className="text-gray-800 font-semibold">{page}</span> de <span className="text-gray-800 font-semibold">{totalPages}</span></span>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"><ChevronRight size={16}/></button>
            </div>
          )}
        </div>
      )}

      {/* Lines */}
      {activeSection === 'lines' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Gestión de Líneas</h2>
            <button onClick={() => setShowLineForm(true)} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
              <PlusCircle size={14} /> Nueva Línea
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lines?.map((line: Route) => {
              const { origin, destination } = getLineEndpoints(line)
              const isEditing = editingLineId === line.id
              return (
                <div key={line.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input value={editLineForm.name} onChange={e => setEditLineForm({...editLineForm, name: e.target.value})} className={inputCls} placeholder="Nombre" />
                      <input value={editLineForm.description} onChange={e => setEditLineForm({...editLineForm, description: e.target.value})} className={inputCls} placeholder="Descripción (opcional)" />
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleSaveEditLine(line)} disabled={savingLine} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                          <Check size={11} /> Guardar
                        </button>
                        <button onClick={() => setEditingLineId(null)} className="flex items-center gap-1 px-3 py-1.5 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs">
                          <X size={11} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{line.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${line.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {line.active ? 'Activa' : 'Inactiva'}
                          </span>
                          <button onClick={() => handleStartEditLine(line)} className="text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={13}/></button>
                        </div>
                      </div>
                      {line.description && <p className="text-gray-400 text-xs mb-2">{line.description}</p>}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-400 text-xs min-w-0">
                          <MapPin size={11} className="shrink-0" />
                          <span className="truncate">{origin || '—'} → {destination || '—'}</span>
                        </div>
                        <button onClick={() => setManagingStationsFor(line)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors shrink-0 ml-2 font-medium">
                          <MapPin size={11} /> Estaciones
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
            {lines?.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-400">
                <MapPin className="mx-auto mb-3 text-gray-300" size={32} />
                <p className="text-sm">No hay líneas registradas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showBusForm  && <BusForm  onClose={() => setShowBusForm(false)}  onSuccess={() => { refetchBuses(); showToast('Bus registrado', 'success') }} onError={msg => showToast(msg,'error')} />}
      {showLineForm && <LineForm onClose={() => setShowLineForm(false)} onSuccess={() => { refetchLines(); showToast('Línea creada', 'success') }}  onError={msg => showToast(msg,'error')} />}
      {managingStationsFor && <StationManager route={managingStationsFor} onClose={() => setManagingStationsFor(null)} showToast={showToast} />}
    </div>
  )
}
