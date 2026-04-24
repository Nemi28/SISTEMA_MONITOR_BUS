import { Bus, OCCUPANCY_STYLES, STATUS_STYLES } from '../types'
import { Bus as BusIcon, Gauge, MapPin, Clock } from 'lucide-react'

interface Props { bus: Bus; onClick: (bus: Bus) => void }

export default function BusCard({ bus, onClick }: Props) {
  const report      = bus.lastReport
  const percent     = report?.occupancyPercent ?? 0
  const level       = report?.occupancyLevel ?? 'LOW'
  const showMetrics = bus.status === 'ACTIVE' && !!bus.routeId
  const st          = STATUS_STYLES[bus.status]
  const occ         = OCCUPANCY_STYLES[level]
  const hasTrack    = showMetrics && !!bus.currentStation && !!bus.nextStation

  const trackColor  = bus.returning ? 'bg-orange-300' : 'bg-blue-300'
  const dotColor    = bus.returning ? 'bg-orange-400 ring-orange-100' : 'bg-blue-500 ring-blue-100'
  const textColor   = bus.returning ? 'text-orange-500' : 'text-blue-600'
  const badgeColor  = bus.returning ? 'bg-orange-50 text-orange-400' : 'bg-blue-50 text-blue-500'

  const RouteTrack = () => (
    <div className="pt-2 border-t border-gray-100 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0 ring-2 ring-gray-100" />
        <div className="relative flex-1 h-1.5 bg-gray-100 rounded-full overflow-visible">
          <div
            className={`h-full rounded-full transition-all duration-700 ${trackColor}`}
            style={{ width: `${bus.routeProgress ?? 50}%` }}
          />
          <span
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-sm leading-none drop-shadow"
            style={{ left: `${bus.routeProgress ?? 50}%` }}
          >🚌</span>
        </div>
        <span className={`w-2 h-2 rounded-full shrink-0 ring-2 ${dotColor}`} />
      </div>
      <div className="flex items-start justify-between gap-1">
        <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[38%]">{bus.currentStation!.name}</span>
        <span className={`shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${badgeColor}`}>
          {bus.returning ? 'Retorno' : 'Ida'}
        </span>
        <span className={`text-[10px] font-semibold leading-tight truncate max-w-[38%] text-right ${textColor}`}>{bus.nextStation!.name}</span>
      </div>
      {bus.etaMinutes != null && (
        <div className={`flex items-center gap-1 text-[10px] font-medium ${textColor}`}>
          <Clock size={10} />
          <span>Llega en <strong>{bus.etaMinutes} min</strong></span>
        </div>
      )}
    </div>
  )

  return (
    <div
      onClick={() => onClick(bus)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-150 cursor-pointer"
    >
      {/* Mobile */}
      <div className="flex md:hidden flex-col px-4 py-3 gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${st.iconBg} flex items-center justify-center shrink-0`}>
            <BusIcon size={15} className={st.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-gray-900 text-sm">{bus.code}</span>
              <span className="text-gray-400 text-xs">{bus.plate}</span>
            </div>
            <p className="text-gray-500 text-xs truncate">{bus.route?.name ?? '—'}</p>
          </div>
          {showMetrics ? (
            <div className="text-right shrink-0">
              <div className="flex items-center gap-2 justify-end mb-0.5">
                {report?.speed && (
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <Gauge size={10} />{report.speed} km/h
                  </span>
                )}
                <span className="text-sm font-bold text-gray-900">{percent}%</span>
              </div>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${occ.badge}`}>{occ.label}</span>
            </div>
          ) : (
            <span className={`text-xs font-medium ${st.text}`}>{st.label}</span>
          )}
        </div>

        {showMetrics && (
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${occ.bar}`} style={{ width: `${percent}%` }} />
          </div>
        )}

        {hasTrack && <RouteTrack />}

        {!showMetrics && (
          <p className={`text-xs italic ${st.text} opacity-60`}>
            {bus.status === 'INACTIVE' ? 'Fuera de servicio' : bus.status === 'MAINTENANCE' ? 'En taller' : 'Sin ruta'}
          </p>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex gap-3 px-4 py-4">
        <div className={`w-10 h-10 rounded-lg ${st.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
          <BusIcon size={18} className={st.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{bus.code}</h3>
              <p className="text-gray-400 text-xs font-mono">{bus.plate}</p>
            </div>
            <span className={`flex items-center gap-1 text-xs font-medium shrink-0 px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
          </div>

          {bus.route ? (
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
              <MapPin size={11} className="shrink-0" />
              <span className="font-medium text-gray-500">{bus.route.name}</span>
              <span className="text-gray-300 mx-0.5">·</span>
              <span className="truncate">{bus.route.origin} → {bus.route.destination}</span>
            </div>
          ) : (
            <p className="text-gray-400 text-xs mb-2 italic">Sin línea asignada</p>
          )}

          {showMetrics ? (
            <div className="space-y-1.5">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${occ.bar}`} style={{ width: `${percent}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${occ.badge}`}>{occ.label}</span>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {report?.speed && <span className="flex items-center gap-1"><Gauge size={11} />{report.speed} km/h</span>}
                  <span className="font-semibold text-gray-700">{percent}%</span>
                </div>
              </div>
              {hasTrack && <RouteTrack />}
            </div>
          ) : (
            <p className={`text-xs italic ${st.text} opacity-60`}>
              {bus.status === 'INACTIVE' ? 'Fuera de servicio' : bus.status === 'MAINTENANCE' ? 'En taller' : 'Sin ruta'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
