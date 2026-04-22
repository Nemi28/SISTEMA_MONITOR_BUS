import { useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { getLastStatus } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { Bus } from '../types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix iconos de Leaflet con Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const nivelCircleColors = {
  BAJO: '#22c55e',
  MEDIO: '#eab308',
  ALTO: '#f97316',
  LLENO: '#ef4444',
}

const createBusIcon = (nivel: string) => {
  const color = nivelCircleColors[nivel as keyof typeof nivelCircleColors] || '#6b7280'
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">🚌</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export default function BusMap() {
  const fetchStatus = useCallback(() => getLastStatus(), [])
  const { data: buses, loading } = usePolling(fetchStatus, 5000)

  const busesConReporte = buses?.filter((b: Bus) => b.ultimoReporte) ?? []

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold text-white">Mapa en Tiempo Real</h2>
        {loading && <span className="text-xs text-gray-400 animate-pulse">Actualizando...</span>}
      </div>

      <div style={{ height: '450px' }}>
        <MapContainer
          center={[-12.0464, -77.0428]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {busesConReporte.map((bus: Bus) => {
            const r = bus.ultimoReporte!
            const nivel = r.nivelOcupacion

            return (
              <Marker
                key={bus.id}
                position={[r.latitud, r.longitud]}
                icon={createBusIcon(nivel)}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{bus.codigo} — {bus.placa}</p>
                    <p>Ruta: {bus.ruta?.nombre ?? 'Sin ruta'}</p>
                    <p>Ocupación: {r.porcentajeOcupacion}% ({nivel})</p>
                    <p>Pasajeros: {r.cantidadPasajeros}/{bus.capacidad}</p>
                    {r.velocidad && <p>Velocidad: {r.velocidad} km/h</p>}
                  </div>
                </Popup>
                <Circle
                  center={[r.latitud, r.longitud]}
                  radius={200}
                  pathOptions={{
                    color: nivelCircleColors[nivel],
                    fillColor: nivelCircleColors[nivel],
                    fillOpacity: 0.1,
                  }}
                />
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Sin buses en mapa */}
      {!loading && busesConReporte.length === 0 && (
        <div className="px-4 py-2 text-center text-gray-500 text-sm border-t border-gray-700">
          No hay buses con ubicación disponible
        </div>
      )}
    </div>
  )
}