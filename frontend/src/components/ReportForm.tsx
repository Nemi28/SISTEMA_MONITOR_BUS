import { useState, useEffect } from "react";
import { createReport, getBuses } from "../services/api";
import { Bus } from "../types";
import { Send, X } from "lucide-react";
import axios from "axios";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  onError?: (message: string) => void;
}

export default function ReportForm({ onClose, onSuccess, onError }: Props) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    busId: "",
    lat: "-12.0464",
    lng: "-77.0428",
    passengerCount: "",
    speed: "",
  });

  useEffect(() => {
    getBuses("active").then((r) => setBuses(r.data));
  }, []);

  const selectedBus = buses.find((b) => b.id === form.busId) ?? null;
  const passengerCountNum = parseInt(form.passengerCount) || 0;
  const exceedsCapacity =
    selectedBus !== null &&
    form.passengerCount !== "" &&
    passengerCountNum > selectedBus.capacity;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exceedsCapacity) return;
    setLoading(true);
    setError(null);
    try {
      await createReport({
        busId: form.busId,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        passengerCount: passengerCountNum,
        speed: form.speed ? parseFloat(form.speed) : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Error al crear reporte")
        : "Error al crear reporte";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Registrar Reporte Manual
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bus</label>
            <select
              name="busId"
              value={form.busId}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Selecciona un bus</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.code} — {bus.plate} (cap. {bus.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Latitud</label>
              <input
                name="lat"
                type="number"
                step="any"
                value={form.lat}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Longitud</label>
              <input
                name="lng"
                type="number"
                step="any"
                value={form.lng}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm text-gray-400">Cantidad de Pasajeros</label>
              {selectedBus && (
                <span className="text-xs text-gray-500">
                  Capacidad máx: <span className="text-gray-300 font-medium">{selectedBus.capacity}</span>
                </span>
              )}
            </div>
            <input
              name="passengerCount"
              type="number"
              min="0"
              max={selectedBus?.capacity}
              value={form.passengerCount}
              onChange={handleChange}
              required
              placeholder="Ej: 45"
              className={`w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border focus:outline-none transition-colors ${
                exceedsCapacity
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-blue-500"
              }`}
            />
            {exceedsCapacity && (
              <p className="text-red-400 text-xs mt-1">
                Excede la capacidad del bus ({selectedBus!.capacity} pasajeros máximo)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Velocidad (km/h) <span className="text-gray-500">— opcional</span>
            </label>
            <input
              name="speed"
              type="number"
              min="0"
              value={form.speed}
              onChange={handleChange}
              placeholder="Ej: 35"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || exceedsCapacity}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              {loading ? "Enviando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
