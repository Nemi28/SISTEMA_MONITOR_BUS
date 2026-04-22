import { useState } from "react";
import { Bus } from "./types";
import Dashboard from "./components/Dashboard";
import BusList from "./components/BusList";
import BusMap from "./components/BusMap";
import SimulationPanel from "./components/simulationPanel";
import ReportForm from "./components/ReportForm";
import BusHistory from "./components/BusHistory";
import { PlusCircle } from "lucide-react";

export default function App() {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus);
    setShowHistory(true);
  };

  const handleReportSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          {/* Top row */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">
                Sistema Monitor de Buses
              </h1>
              <p className="text-gray-400 text-xs md:text-sm hidden sm:block">
                Monitoreo de flota en tiempo real
              </p>
            </div>
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Nuevo Reporte</span>
            </button>
          </div>
          {/* Simulation panel abajo en mobile */}
          <div className="mt-2">
            <SimulationPanel />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Dashboard métricas */}
        <Dashboard />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 pb-0">
          {(["list", "map"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab === "list" ? "Lista de Buses" : "Mapa"}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {activeTab === "list" && (
          <BusList key={refreshKey} onSelectBus={handleSelectBus} />
        )}
        {activeTab === "map" && <BusMap />}
      </main>

      {/* Modales */}
      {showReportForm && (
        <ReportForm
          onClose={() => setShowReportForm(false)}
          onSuccess={handleReportSuccess}
        />
      )}

      {showHistory && selectedBus && (
        <BusHistory
          busId={selectedBus.id}
          busCodigo={selectedBus.codigo}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
