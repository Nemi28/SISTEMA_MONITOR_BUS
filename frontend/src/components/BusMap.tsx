import { useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { getLastStatus } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { Bus } from '../types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icons with Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const levelCircleColors = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#f97316',
  FULL: '#ef4444',
}

const createBusIcon = (level: string, code: string) => {
  const color = levelCircleColors[level as keyof typeof levelCircleColors] || '#6b7280'
  return L.divIcon({
    className: '',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <div style="
          background: #1f2937;
          color: white;
          font-size: 9px;
          font-weight: bold;
          padding: 1px 4px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0,0,0,0.5);
        ">${code}</div>
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
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 52],
  })
}

export default function BusMap() {
  const fetchStatus = useCallback(() => getLastStatus(), [])
  const { data: buses, loading } = usePolling(fetchStatus, 5000)

  const busesWithReport = buses?.filter((b: Bus) => b.lastReport) ?? []

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

          {busesWithReport.map((bus: Bus) => {
            const r = bus.lastReport!
            const level = r.occupancyLevel

            return (
              <Marker
                key={bus.id}
                position={[r.lat, r.lng]}
                icon={createBusIcon(level, bus.code)}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{bus.code} — {bus.plate}</p>
                    <p>Ruta: {bus.route?.name ?? 'Sin ruta'}</p>
                    <p>Ocupación: {r.occupancyPercent}% ({level})</p>
                    <p>Pasajeros: {r.passengerCount}/{bus.capacity}</p>
                    {r.speed && <p>Velocidad: {r.speed} km/h</p>}
                  </div>
                </Popup>
                <Circle
                  center={[r.lat, r.lng]}
                  radius={200}
                  pathOptions={{
                    color: levelCircleColors[level],
                    fillColor: levelCircleColors[level],
                    fillOpacity: 0.1,
                  }}
                />
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {!loading && busesWithReport.length === 0 && (
        <div className="px-4 py-2 text-center text-gray-500 text-sm border-t border-gray-700">
          No hay buses con ubicación disponible
        </div>
      )}
    </div>
  )
}
