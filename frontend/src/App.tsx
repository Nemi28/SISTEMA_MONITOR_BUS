import { useState } from 'react'
import { Bus } from './types'
import Dashboard from './components/Dashboard'
import BusList from './components/BusList'
import BusMap from './components/BusMap'
import SimulationPanel from './components/SimulationPanel'
import ReportForm from './components/ReportForm'
import BusHistory from './components/BusHistory'
import ManagementPanel from './components/ManagementPanel'
import Toaster from './components/Toaster'
import { useToast } from './hooks/useToast'
import { PlusCircle, Bus as BusIcon, Map, Settings, Activity } from 'lucide-react'

const tabs = [
  { key: 'list',       label: 'Lista',   icon: BusIcon },
  { key: 'map',        label: 'Mapa',    icon: Map },
  { key: 'management', label: 'Gestión', icon: Settings },
] as const

export default function App() {
  const [selectedBus, setSelectedBus]       = useState<Bus | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [showHistory, setShowHistory]       = useState(false)
  const [activeTab, setActiveTab]           = useState<'list' | 'map' | 'management'>('list')
  const [refreshKey, setRefreshKey]         = useState(0)

  const { toasts, showToast, removeToast } = useToast()

  const handleSelectBus     = (bus: Bus) => { setSelectedBus(bus); setShowHistory(true) }
  const handleReportSuccess = () => { setRefreshKey(k => k + 1); showToast('Reporte registrado', 'success') }
  const handleReportError   = (msg: string) => showToast(msg, 'error')

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Top accent */}
      <div className="h-0.5 w-full bg-blue-600" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between h-14 gap-4">

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Activity size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-none">
                  Grow<span className="text-blue-600">Monitor</span>
                </p>
                <p className="hidden sm:block text-[10px] text-gray-400 leading-none mt-0.5">by Grow Analytics</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-0.5">
              {tabs.map(tab => {
                const active = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      active ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <SimulationPanel />
              <button
                onClick={() => setShowReportForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={14} />
                <span className="hidden sm:inline">Nuevo Reporte</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-white border-t border-gray-200">
        {tabs.map(tab => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <tab.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Main */}
      <main className="flex-1 w-full px-3 md:px-8 py-5 space-y-5 pb-20 md:pb-6">
        <Dashboard />
        {activeTab === 'list'       && <BusList key={refreshKey} onSelectBus={handleSelectBus} />}
        {activeTab === 'map'        && <BusMap />}
        {activeTab === 'management' && <ManagementPanel showToast={showToast} />}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white border-t border-gray-200">
        <div className="w-full px-8 py-3 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            © 2026 <span className="text-gray-600 font-medium">GrowMonitor</span> — Monitoreo de flota en tiempo real
          </p>
          <p className="text-xs text-gray-400">
            by Grow Analytics · <span className="text-gray-500 font-medium">Nemias del Aguila</span>
          </p>
        </div>
      </footer>

      {showReportForm && <ReportForm onClose={() => setShowReportForm(false)} onSuccess={handleReportSuccess} onError={handleReportError} />}
      {showHistory && selectedBus && <BusHistory busId={selectedBus.id} busCode={selectedBus.code} onClose={() => setShowHistory(false)} />}
      <Toaster toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
