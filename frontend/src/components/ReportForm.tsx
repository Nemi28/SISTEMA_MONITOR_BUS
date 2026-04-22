import { useState, useEffect } from "react";
import { createReport, getBuses } from "../services/api";
import { Bus } from "../types";
import { Send, X } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportForm({ onClose, onSuccess }: Props) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    busId: "",
    latitud: "-12.0464",
    longitud: "-77.0428",
    cantidadPasajeros: "",
    velocidad: "",
  });

  useEffect(() => {
    getBuses("active").then(setBuses);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createReport({
        busId: form.busId,
        latitud: parseFloat(form.latitud),
        longitud: parseFloat(form.longitud),
        cantidadPasajeros: parseInt(form.cantidadPasajeros),
        velocidad: form.velocidad ? parseFloat(form.velocidad) : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al crear reporte";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Registrar Reporte Manual
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bus */}
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
                  {bus.codigo} — {bus.placa} (cap. {bus.capacidad})
                </option>
              ))}
            </select>
          </div>

          {/* Latitud y Longitud */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Latitud
              </label>
              <input
                name="latitud"
                type="number"
                step="any"
                value={form.latitud}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Longitud
              </label>
              <input
                name="longitud"
                type="number"
                step="any"
                value={form.longitud}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Pasajeros */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Cantidad de Pasajeros
            </label>
            <input
              name="cantidadPasajeros"
              type="number"
              min="0"
              value={form.cantidadPasajeros}
              onChange={handleChange}
              required
              placeholder="Ej: 45"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Velocidad */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Velocidad (km/h) <span className="text-gray-500">— opcional</span>
            </label>
            <input
              name="velocidad"
              type="number"
              min="0"
              value={form.velocidad}
              onChange={handleChange}
              placeholder="Ej: 35"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Botones */}
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
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm disabled:opacity-50"
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
