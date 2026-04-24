import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBus, getLines } from '../services/api'
import { X, Bus } from 'lucide-react'
import { Route } from '../types'
import { busSchema, BusFormData } from '../validators'
import axios from 'axios'

interface Props { onClose: () => void; onSuccess: () => void; onError?: (msg: string) => void }

const inputCls = (error?: boolean) =>
  `w-full bg-white text-gray-900 text-sm rounded-lg px-3 py-2 border ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 focus:outline-none transition-colors`

export default function BusForm({ onClose, onSuccess, onError }: Props) {
  const [lines, setLines] = useState<Route[]>([])
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
  })

  useEffect(() => { getLines().then(setLines) }, [])

  const onSubmit = async (data: BusFormData) => {
    try {
      await createBus({
        code: data.code,
        plate: data.plate,
        capacity: data.capacity,
        model: data.model || undefined,
        routeId: data.routeId || undefined,
      })
      onSuccess(); onClose()
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Error al crear bus') : 'Error al crear bus'
      onError?.(msg)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-lg">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Bus size={14} className="text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Registrar Bus</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input {...register('code')} placeholder="BUS-009" className={inputCls(!!errors.code)} />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
              <input {...register('plate')} placeholder="XYZ-789" className={inputCls(!!errors.plate)} />
              {errors.plate && <p className="text-red-500 text-xs mt-1">{errors.plate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
              <input {...register('capacity')} type="number" placeholder="80" className={inputCls(!!errors.capacity)} />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo <span className="text-gray-400 font-normal">— opc.</span></label>
              <input {...register('model')} placeholder="Volvo B8R" className={inputCls(!!errors.model)} />
              {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Línea <span className="text-gray-400 font-normal">— opcional</span></label>
            <select {...register('routeId')} className={inputCls()}>
              <option value="">Sin línea asignada</option>
              {lines.map(l => <option key={l.id} value={l.id}>{l.name} — {l.origin} → {l.destination}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Registrando...' : 'Registrar Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
