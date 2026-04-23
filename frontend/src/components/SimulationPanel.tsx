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
    try {
      if (isRunning) {
        await stopSimulation()
      } else {
        await startSimulation(5)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
      <span className="text-sm text-gray-300">
        Simulación: <span className={isRunning ? 'text-green-400' : 'text-red-400'}>
          {isRunning ? 'Activa' : 'Detenida'}
        </span>
      </span>
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          isRunning
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        } disabled:opacity-50`}
      >
        {loading ? '...' : isRunning ? 'Detener' : 'Iniciar'}
      </button>
    </div>
  )
}
