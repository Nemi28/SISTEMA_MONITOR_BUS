import { useState, useCallback } from 'react'
import { getSimulationStatus, startSimulation, stopSimulation } from '../services/api'
import { usePolling } from '../hooks/usePolling'

export default function SimulationPanel() {
  const [loading, setLoading] = useState(false)
  const fetchStatus = useCallback(() => getSimulationStatus(), [])
  const { data: status } = usePolling(fetchStatus, 5000)
  const isRunning = status?.isRunning ?? false

  const toggle = async () => {
    setLoading(true)
    try { isRunning ? await stopSimulation() : await startSimulation(5) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
        <span className={`text-xs font-medium ${isRunning ? 'text-green-700' : 'text-gray-400'}`}>
          {isRunning ? 'Activa' : 'Inactiva'}
        </span>
      </div>
      <button
        onClick={toggle} disabled={loading}
        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors disabled:opacity-50 ${
          isRunning
            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
        }`}
      >
        {loading ? '...' : isRunning ? 'Detener' : 'Iniciar'}
      </button>
    </div>
  )
}
