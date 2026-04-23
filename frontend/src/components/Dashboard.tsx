import { useCallback } from 'react'
import { getLastStatus } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { Bus as BusIcon, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { Bus } from '../types'

export default function Dashboard() {
  const fetchStatus = useCallback(() => getLastStatus(), [])
  const { data: buses } = usePolling(fetchStatus, 5000)

  const total = buses?.length ?? 0
  const full = buses?.filter((b: Bus) => b.lastReport?.occupancyLevel === 'FULL').length ?? 0
  const withLocation = buses?.filter((b: Bus) => b.lastReport).length ?? 0
  const avgOccupancy = buses?.length
    ? Math.round(
        buses.reduce((acc: number, b: Bus) => acc + (b.lastReport?.occupancyPercent ?? 0), 0) /
          buses.length
      )
    : 0

  const stats = [
    {
      label: 'Total Buses',
      value: total,
      icon: BusIcon,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Con Ubicación',
      value: withLocation,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Buses Llenos',
      value: full,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
    {
      label: 'Ocupación Promedio',
      value: `${avgOccupancy}%`,
      icon: Users,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
            <stat.icon className={stat.color} size={20} />
          </div>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
