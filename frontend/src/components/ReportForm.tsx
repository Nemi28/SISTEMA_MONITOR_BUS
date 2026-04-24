import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createReport, getBuses } from '../services/api'
import { Bus } from '../types'
import { Send, X } from 'lucide-react'
import { reportSchema, ReportFormData } from '../validators'
import axios from 'axios'

interface Props { onClose: () => void; onSuccess: () => void; onError?: (msg: string) => void }

const inputCls = (error?: boolean) =>
  `w-full bg-white text-gray-900 text-sm rounded-lg px-3 py-2 border ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 focus:outline-none transition-colors`

export default function ReportForm({ onClose, onSuccess, onError }: Props) {
  const [buses, setBuses] = useState<Bus[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: { lat: -12.0464, lng: -77.0428, passengerCount: 0 },
  })

  useEffect(() => { getBuses('active').then(r => setBuses(r.data)) }, [])

  const busId = useWatch({ control, name: 'busId' })
  const passengerCount = useWatch({ control, name: 'passengerCount' })
  const selectedBus = buses.find(b => b.id === busId) ?? null
  const exceedsCapacity = selectedBus !== null && passengerCount !== undefined && Number(passengerCount) > selectedBus.capacity

  const onSubmit = async (data: ReportFormData) => {
    if (exceedsCapacity) return
    setServerError(null)
    try {
      await createReport({
        busId: data.busId,
        lat: data.lat,
        lng: data.lng,
        passengerCount: data.passengerCount,
        speed: data.speed ?? undefined,
      })
      onSuccess(); onClose()
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Error al crear reporte') : 'Error al crear reporte'
      setServerError(msg); onError?.(msg)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-lg">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Registrar Reporte Manual</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
            <select {...register('busId')} className={inputCls(!!errors.busId)}>
              <option value="">Selecciona un bus</option>
              {buses.map(b => <option key={b.id} value={b.id}>{b.code} — {b.plate} (cap. {b.capacity})</option>)}
            </select>
            {errors.busId && <p className="text-red-500 text-xs mt-1">{errors.busId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
              <input {...register('lat', { valueAsNumber: true })} type="number" step="any" className={inputCls(!!errors.lat)} />
              {errors.lat && <p className="text-red-500 text-xs mt-1">{errors.lat.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
              <input {...register('lng', { valueAsNumber: true })} type="number" step="any" className={inputCls(!!errors.lng)} />
              {errors.lng && <p className="text-red-500 text-xs mt-1">{errors.lng.message}</p>}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Cantidad de Pasajeros</label>
              {selectedBus && <span className="text-xs text-gray-400">máx: {selectedBus.capacity}</span>}
            </div>
            <input {...register('passengerCount', { valueAsNumber: true })} type="number" placeholder="Ej: 45"
              className={inputCls(!!errors.passengerCount || exceedsCapacity)} />
            {errors.passengerCount && <p className="text-red-500 text-xs mt-1">{errors.passengerCount.message}</p>}
            {exceedsCapacity && <p className="text-red-500 text-xs mt-1">Excede la capacidad máxima ({selectedBus!.capacity})</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Velocidad (km/h) <span className="text-gray-400 font-normal">— opcional</span></label>
            <input {...register('speed', { valueAsNumber: true })} type="number" placeholder="Ej: 35" className={inputCls(!!errors.speed)} />
            {errors.speed && <p className="text-red-500 text-xs mt-1">{errors.speed.message}</p>}
          </div>

          {serverError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{serverError}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors">Cancelar</button>
            <button type="submit" disabled={isSubmitting || exceedsCapacity}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
              <Send size={13} />{isSubmitting ? 'Enviando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
