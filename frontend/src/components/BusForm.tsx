import { useState, useEffect } from "react";
import { createBus, getLines } from "../services/api";
import { X, Bus } from "lucide-react";
import { Route } from "../types";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  onError?: (message: string) => void;
}

export default function BusForm({ onClose, onSuccess, onError }: Props) {
  const [lines, setLines] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    plate: "",
    capacity: "",
    model: "",
    routeId: "",
  });

  useEffect(() => {
    getLines().then(setLines);
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
      await createBus({
        code: form.code,
        plate: form.plate,
        capacity: parseInt(form.capacity),
        model: form.model || undefined,
        routeId: form.routeId || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear bus";
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
          <div className="flex items-center gap-2">
            <Bus size={20} className="text-blue-400" />
            <h2 className="text-xl font-bold text-white">Registrar Bus</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Código</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                placeholder="BUS-009"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Placa</label>
              <input
                name="plate"
                value={form.plate}
                onChange={handleChange}
                required
                placeholder="XYZ-789"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Capacidad</label>
              <input
                name="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleChange}
                required
                placeholder="80"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Modelo <span className="text-gray-500">— opcional</span>
              </label>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Volvo B8R"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Línea <span className="text-gray-500">— opcional</span>
            </label>
            <select
              name="routeId"
              value={form.routeId}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Sin línea asignada</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name} — {line.origin} → {line.destination}
                </option>
              ))}
            </select>
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
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar Bus"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
