import { useState, useEffect, useRef } from 'react'
import { X, MapPin, Plus, Pencil, Trash2, Check, Ban, ListOrdered, PackagePlus, GripVertical } from 'lucide-react'
import { Station, Route } from '../types'
import { getStationsByLine, getAvailableForRoute, createStation, assignStation, unassignStation, updateStation, deleteStation, updateLine, reorderStation } from '../services/api'
import axios from 'axios'

interface Props { route: Route; onClose: () => void; showToast: (msg: string, type?: 'success' | 'error') => void }

const emptyForm = { name: '', lat: '', lng: '' }
const inputCls  = "w-full bg-white text-gray-900 text-sm rounded-lg px-3 py-1.5 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"

export default function StationManager({ route, onClose, showToast }: Props) {
  const [tab, setTab]                   = useState<'assigned' | 'available'>('assigned')
  const [assigned, setAssigned]         = useState<Station[]>([])
  const [available, setAvailable]       = useState<Station[]>([])
  const [loading, setLoading]           = useState(true)
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [editForm, setEditForm]         = useState(emptyForm)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm]     = useState(emptyForm)
  const [saving, setSaving]             = useState(false)
  const [reordering, setReordering]     = useState(false)
  const dragId     = useRef<string | null>(null)
  const dragOverId = useRef<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [asgn, avail] = await Promise.all([getStationsByLine(route.id), getAvailableForRoute(route.id)])
      setAssigned(asgn); setAvailable(avail)
      return asgn as Station[]
    } finally { setLoading(false) }
  }

  const syncRouteEndpoints = async (stations: Station[]) => {
    const origin = stations[0]?.name ?? ''
    const destination = stations[stations.length - 1]?.name ?? ''
    await updateLine(route.id, { origin, destination })
  }

  useEffect(() => { fetchData() }, [route.id])

  const handleDragStart = (id: string) => { dragId.current = id }
  const handleDragOver  = (e: React.DragEvent, id: string) => { e.preventDefault(); dragOverId.current = id }
  const handleDrop = async () => {
    const fromId = dragId.current; const toId = dragOverId.current
    dragId.current = null; dragOverId.current = null
    if (!fromId || !toId || fromId === toId) return
    const reordered = [...assigned]
    const fromIdx = reordered.findIndex(s => s.id === fromId)
    const toIdx   = reordered.findIndex(s => s.id === toId)
    if (fromIdx === -1 || toIdx === -1) return
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const updated = reordered.map((s, i) => ({ ...s, order: i + 1 }))
    setAssigned(updated)
    setReordering(true)
    try {
      await Promise.all(updated.map(s => reorderStation(s.id, route.id, s.order)))
      await syncRouteEndpoints(updated)
      showToast('Orden actualizado', 'success')
    } catch { showToast('Error al guardar el orden', 'error'); fetchData() }
    finally { setReordering(false) }
  }

  const handleUnassign = async (id: string) => {
    try { await unassignStation(id, route.id); const u = await fetchData(); if (u) await syncRouteEndpoints(u); showToast('Estación quitada', 'success') }
    catch { showToast('Error al quitar estación', 'error') }
  }

  const handleSaveEdit = async (id: string) => {
    setSaving(true)
    try { await updateStation(id, { name: editForm.name, lat: parseFloat(editForm.lat), lng: parseFloat(editForm.lng) }); setEditingId(null); showToast('Estación actualizada', 'success'); fetchData() }
    catch { showToast('Error al actualizar', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta estación permanentemente?')) return
    try { await deleteStation(id); showToast('Estación eliminada', 'success'); fetchData() }
    catch { showToast('Error al eliminar', 'error') }
  }

  const handleAssign = async (station: Station) => {
    const nextOrder = assigned.length > 0 ? Math.max(...assigned.map(s => s.order ?? 0)) + 1 : 1
    try { await assignStation(station.id, route.id, nextOrder); const u = await fetchData(); if (u) await syncRouteEndpoints(u); showToast(`"${station.name}" agregada`, 'success') }
    catch { showToast('Error al agregar estación', 'error') }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await createStation({ name: createForm.name, lat: parseFloat(createForm.lat), lng: parseFloat(createForm.lng) })
      setCreateForm(emptyForm); setShowCreateForm(false)
      showToast('Estación creada', 'success'); fetchData()
    } catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Error al crear') : 'Error al crear', 'error')
    } finally { setSaving(false) }
  }

  const tabs = [
    { key: 'assigned',  label: 'Asignadas',   icon: ListOrdered, count: assigned.length },
    { key: 'available', label: 'Disponibles',  icon: PackagePlus, count: available.length },
  ] as const

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl border border-gray-200 shadow-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-start px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Estaciones — {route.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{route.origin} → {route.destination}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <t.icon size={14} />
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                tab === t.key ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-lg h-12 animate-pulse" />)}
            </div>
          )}

          {/* Asignadas */}
          {!loading && tab === 'assigned' && (
            <div className="space-y-2">
              {assigned.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <MapPin className="mx-auto mb-2 text-gray-300" size={32} />
                  <p className="text-sm">No hay estaciones asignadas</p>
                  <button onClick={() => setTab('available')} className="mt-2 text-blue-600 text-sm hover:underline">
                    Ir a Disponibles para agregar
                  </button>
                </div>
              )}
              {assigned.map(station => (
                <div key={station.id} draggable
                  onDragStart={() => handleDragStart(station.id)}
                  onDragOver={e => handleDragOver(e, station.id)}
                  onDrop={handleDrop}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing active:opacity-60 transition-opacity">
                  {editingId === station.id ? (
                    <div className="p-3 space-y-2">
                      <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} maxLength={100} className={inputCls} placeholder="Nombre" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" step="any" min="-90" max="90" value={editForm.lat} onChange={e => setEditForm({...editForm, lat: e.target.value})} className={inputCls} placeholder="Latitud" />
                        <input type="number" step="any" min="-180" max="180" value={editForm.lng} onChange={e => setEditForm({...editForm, lng: e.target.value})} className={inputCls} placeholder="Longitud" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(station.id)} disabled={saving}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                          <Check size={12} /> Guardar
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs">
                          <Ban size={12} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <GripVertical size={14} className="text-gray-300 shrink-0" />
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {station.order ?? '—'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">{station.name}</p>
                        <p className="text-gray-400 text-xs">{station.lat.toFixed(4)}, {station.lng.toFixed(4)}</p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <button onClick={() => { setEditingId(station.id); setEditForm({ name: station.name, lat: String(station.lat), lng: String(station.lng) }) }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => handleUnassign(station.id)}
                          className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"><X size={13} /></button>
                        <button onClick={() => handleDelete(station.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Disponibles */}
          {!loading && tab === 'available' && (
            <div className="space-y-3">
              {showCreateForm ? (
                <form onSubmit={handleCreate} className="bg-gray-50 rounded-xl p-4 border border-blue-200 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Nueva estación</p>
                  <input value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required maxLength={100} placeholder="Nombre de la estación" className={inputCls} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" step="any" min="-90" max="90" value={createForm.lat} onChange={e => setCreateForm({...createForm, lat: e.target.value})} required placeholder="Latitud" className={inputCls} />
                    <input type="number" step="any" min="-180" max="180" value={createForm.lng} onChange={e => setCreateForm({...createForm, lng: e.target.value})} required placeholder="Longitud" className={inputCls} />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      <Check size={13} /> {saving ? 'Creando...' : 'Crear estación'}
                    </button>
                    <button type="button" onClick={() => setShowCreateForm(false)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm">
                      <Ban size={13} /> Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 text-gray-400 hover:text-blue-600 text-sm transition-colors">
                  <Plus size={14} /> Crear nueva estación
                </button>
              )}

              {available.length === 0 && !showCreateForm && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>Todas las estaciones ya están en esta ruta</p>
                  <p className="text-xs mt-1 text-gray-300">Crea una nueva arriba</p>
                </div>
              )}
              {available.map(station => (
                <div key={station.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                  <MapPin size={15} className="text-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{station.name}</p>
                    <p className="text-gray-400 text-xs">{station.lat.toFixed(4)}, {station.lng.toFixed(4)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleAssign(station)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
                      <Plus size={11} /> Asignar
                    </button>
                    <button onClick={() => handleDelete(station.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>
            {assigned.length} estación{assigned.length !== 1 ? 'es' : ''} en esta ruta
            {reordering && <span className="ml-2 text-blue-600 animate-pulse">· Guardando orden...</span>}
          </span>
          <span>{available.length} disponible{available.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}
