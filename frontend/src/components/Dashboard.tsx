import { useCallback } from 'react'
import { getBuses, getLastStatus } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { Bus as BusIcon, WrenchIcon, PowerOff, Activity, Users } from 'lucide-react'
import { Bus } from '../types'

const stats_config = [
  { key: 'total',       label: 'Total buses',      icon: BusIcon,    color: 'text-blue-600',  bg: 'bg-blue-50'  },
  { key: 'active',      label: 'Activos',           icon: Activity,   color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'inactive',    label: 'Inactivos',         icon: PowerOff,   color: 'text-red-500',   bg: 'bg-red-50'   },
  { key: 'maintenance', label: 'Mantenimiento',     icon: WrenchIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'occupancy',   label: 'Ocupación prom.',   icon: Users,      color: 'text-purple-600',bg: 'bg-purple-50'},
]

export default function Dashboard() {
  const fetchAll  = useCallback(() => getBuses(undefined, undefined, undefined, 1, 200), [])
  const fetchLive = useCallback(() => getLastStatus(), [])

  const { data: busResult } = usePolling(fetchAll, 8000)
  const { data: liveBuses } = usePolling(fetchLive, 5000)

  const all         = busResult?.data ?? []
  const total       = busResult?.total ?? 0
  const active      = all.filter((b: Bus) => b.status === 'ACTIVE').length
  const inactive    = all.filter((b: Bus) => b.status === 'INACTIVE').length
  const maintenance = all.filter((b: Bus) => b.status === 'MAINTENANCE').length

  const live        = (liveBuses as Bus[]) ?? []
  const critical    = live.filter((b: Bus) => b.lastReport?.occupancyLevel === 'FULL' || b.lastReport?.occupancyLevel === 'HIGH').length
  const avgOcc      = live.length
    ? Math.round(live.reduce((a, b: Bus) => a + (b.lastReport?.occupancyPercent ?? 0), 0) / live.length)
    : 0

  const barColor = avgOcc >= 85 ? 'bg-red-500' : avgOcc >= 65 ? 'bg-orange-400' : avgOcc >= 40 ? 'bg-amber-400' : 'bg-green-500'

  const values = [
    { value: String(total),  badge: null,                     bar: null },
    { value: String(active), badge: total ? `${Math.round(active/total*100)}%` : '0%', bar: total ? active/total*100 : 0 },
    { value: String(inactive), badge: total ? `${Math.round(inactive/total*100)}%` : '0%', bar: total ? inactive/total*100 : 0 },
    { value: String(maintenance), badge: total ? `${Math.round(maintenance/total*100)}%` : '0%', bar: total ? maintenance/total*100 : 0 },
    { value: `${avgOcc}%`,   badge: critical > 0 ? `${critical} crítico${critical>1?'s':''}` : null, bar: avgOcc },
  ]

  const barColors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-amber-400', barColor]

  return (
    <>
      {/* Mobile scroll */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-1 -mx-3 px-3 snap-x snap-mandatory scrollbar-none">
        {stats_config.map((s, i) => (
          <div key={s.key} className="snap-start shrink-0 w-32 bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className={`w-6 h-6 rounded-md ${s.bg} flex items-center justify-center`}>
                <s.icon size={13} className={s.color} />
              </div>
              {values[i].badge && <span className="text-[9px] font-medium text-gray-500">{values[i].badge}</span>}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{values[i].value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
            {values[i].bar != null && (
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColors[i]}`} style={{ width: `${values[i].bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-5 gap-3">
        {stats_config.map((s, i) => (
          <div key={s.key} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
              {values[i].badge && <span className="text-xs text-gray-500 font-medium">{values[i].badge}</span>}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{values[i].value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
            {values[i].bar != null && (
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${barColors[i]}`} style={{ width: `${values[i].bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
