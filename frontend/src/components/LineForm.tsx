import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, MapPin, Plus, Trash2 } from 'lucide-react'
import axios from 'axios'
import { Station } from '../types'
import { getAllStations, assignStation, createLine } from '../services/api'
import { lineSchema, LineFormData } from '../validators'

interface Props { onClose: () => void; onSuccess: () => void; onError?: (msg: string) => void }
interface SelectedStation extends Station { order: number }

const inputCls = (error?: boolean) =>
  `w-full bg-white text-gray-900 text-sm rounded-lg px-3 py-2 border ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 focus:outline-none transition-colors`
const labelCls = "block text-sm font-medium text-gray-700 mb-1"

export default function LineForm({ onClose, onSuccess, onError }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [allStations, setAllStations] = useState<Station[]>([])
  const [selected, setSelected]       = useState<SelectedStation[]>([])
  const [pickStation, setPickStation] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LineFormData>({
    resolver: zodResolver(lineSchema),
  })

  useEffect(() => { getAllStations().then(setAllStations).catch(() => {}) }, [])

  const available = allStations.filter(s => !selected.find(sel => sel.id === s.id))

  const handleAdd = () => {
    const station = allStations.find(s => s.id === pickStation)
    if (!station) return
    setSelected(prev => [...prev, { ...station, order: prev.length + 1 }])
    setPickStation('')
  }

  const handleRemove = (id: string) => {
    setSelected(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })))
  }

  const onSubmit = async (data: LineFormData) => {
    setServerError(null)
    try {
      const origin = selected[0]?.name ?? ''
      const destination = selected[selected.length - 1]?.name ?? ''
      const line = await createLine({ name: data.name, description: data.description || undefined, origin, destination })
      for (const s of selected) await assignStation(s.id, line.id, s.order)
      onSuccess(); onClose()
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Error al crear línea') : 'Error al crear línea'
      setServerError(msg); onError?.(msg)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-xl w-full max-w-lg border border-gray-200 shadow-lg flex flex-col max-h-[92vh]">

        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
              <MapPin size={14} className="text-green-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Crear Línea</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            <div>
              <label className={labelCls}>Nombre</label>
              <input {...register('name')} placeholder="Línea D" className={inputCls(!!errors.name)} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Descripción <span className="text-gray-400 font-normal">— opcional</span></label>
              <input {...register('description')} placeholder="Ruta express norte" className={inputCls(!!errors.description)} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Estaciones en orden</label>
              <p className="text-xs text-gray-400 mb-2">La primera será el origen y la última el destino.</p>

              <div className="flex gap-2 mb-3">
                <select value={pickStation} onChange={e => setPickStation(e.target.value)} className={inputCls()}>
                  <option value="">Seleccionar estación...</option>
                  {available.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button type="button" onClick={handleAdd} disabled={!pickStation}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <Plus size={14} /> Agregar
                </button>
              </div>

              {selected.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-4 border border-dashed border-gray-300 rounded-xl">
                  Sin estaciones — puedes agregarlas después
                </p>
              ) : (
                <div className="space-y-1.5">
                  {selected.map((s, idx) => (
                    <div key={s.id} className="relative">
                      {idx === 0 && (
                        <span className="absolute -top-2 left-2 text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded z-10 font-medium">Origen</span>
                      )}
                      {idx === selected.length - 1 && selected.length > 1 && (
                        <span className="absolute -top-2 left-2 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded z-10 font-medium">Destino</span>
                      )}
                      <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
                        idx === 0 ? 'bg-green-50 border-green-200' :
                        idx === selected.length - 1 && selected.length > 1 ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{s.order}</span>
                        <span className="flex-1 text-sm text-gray-800 truncate">{s.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">{s.lat.toFixed(3)}, {s.lng.toFixed(3)}</span>
                        <button type="button" onClick={() => handleRemove(s.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {serverError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{serverError}</p>}
          </div>

          <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Creando...' : 'Crear Línea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
