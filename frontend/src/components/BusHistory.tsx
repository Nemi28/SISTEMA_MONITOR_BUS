import { useEffect, useState, useCallback } from 'react'
import { Report, OCCUPANCY_STYLES } from '../types'
import { getReportsByBus } from '../services/api'
import { X, Clock, Users, Gauge, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  busId: string
  busCode: string
  onClose: () => void
}

const PAGE_SIZE = 20


export default function BusHistory({ busId, busCode, onClose }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await getReportsByBus(busId, PAGE_SIZE, p * PAGE_SIZE)
      setReports(res.data)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [busId])

  useEffect(() => { fetchPage(0) }, [fetchPage])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const handlePage = (p: number) => { setPage(p); fetchPage(p) }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Historial — {busCode}</h2>
            {total > 0 && <p className="text-xs text-slate-400 mt-0.5">{total} reportes en total</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {loading && [...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-lg h-14 animate-pulse" />
          ))}

          {!loading && reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Clock size={36} className="mb-3 text-slate-300" />
              <p className="text-sm">Sin reportes registrados</p>
            </div>
          )}

          {!loading && reports.map((r) => (
            <div key={r.id} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${OCCUPANCY_STYLES[r.occupancyLevel].badge}`}>
                    {OCCUPANCY_STYLES[r.occupancyLevel].label}
                  </span>
                  <span className="text-sm font-bold text-slate-700">{r.occupancyPercent}%</span>
                </div>
                <span className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleString('es-PE')}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Users size={11} /> {r.passengerCount} pasajeros</span>
                {r.speed && <span className="flex items-center gap-1"><Gauge size={11} /> {r.speed} km/h</span>}
                <span className="flex items-center gap-1"><MapPin size={11} /> {r.lat.toFixed(4)}, {r.lng.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Página {page + 1} de {totalPages} · {reports.length} de {total}
            </span>
            <div className="flex gap-2">
              <button onClick={() => handlePage(page - 1)} disabled={page === 0 || loading}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => handlePage(page + 1)} disabled={page >= totalPages - 1 || loading}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
