import { useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import { getLastStatus, getLines } from '../services/api'
import { usePolling } from '../hooks/usePolling'
import { Bus, Route } from '../types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Color por línea (índice → color)
const LINE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6']

const occupancyColors: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', FULL: '#ef4444',
}

const createBusIcon = (level: string, code: string, routeColor: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="
          background:${routeColor};color:white;font-size:9px;font-weight:bold;
          padding:1px 5px;border-radius:4px;white-space:nowrap;
          box-shadow:0 1px 4px rgba(0,0,0,0.5);
        ">${code}</div>
        <div style="
          background:${occupancyColors[level] ?? '#6b7280'};
          width:28px;height:28px;border-radius:50%;
          border:3px solid ${routeColor};
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;font-size:13px;
        ">🚌</div>
      </div>`,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
  })

export default function BusMap() {
  const fetchBuses = useCallback(() => getLastStatus(), [])
  const fetchLines = useCallback(() => getLines(), [])

  const { data: buses, loading: loadingBuses } = usePolling(fetchBuses, 5000)
  const { data: lines } = usePolling(fetchLines, 30000)

  const busesWithReport = (buses as Bus[] ?? []).filter((b) => b.lastReport)

  // Map routeId → color index
  const routeColorMap: Record<string, string> = {}
  ;(lines as Route[] ?? []).forEach((line, i) => {
    routeColorMap[line.id] = LINE_COLORS[i % LINE_COLORS.length]
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <h2 className="font-semibold text-gray-800">Mapa en Tiempo Real</h2>
        {loadingBuses && <span className="text-xs text-slate-400 animate-pulse">Actualizando...</span>}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 ml-auto">
          {(lines as Route[] ?? []).map((line, i) => (
            <div key={line.id} className="flex items-center gap-1.5">
              <div
                className="w-6 h-1.5 rounded-full"
                style={{ background: LINE_COLORS[i % LINE_COLORS.length] }}
              />
              <span className="text-xs text-slate-500">{line.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '500px' }}>
        <MapContainer
          center={[-12.0464, -77.0428]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ── Route polylines ── */}
          {(lines as Route[] ?? []).map((line, i) => {
            const stations = line.routeStations ?? []
            if (stations.length < 2) return null
            const color = LINE_COLORS[i % LINE_COLORS.length]
            const coords: [number, number][] = stations.map((rs) => [rs.station.lat, rs.station.lng])
            return (
              <Polyline
                key={line.id}
                positions={coords}
                pathOptions={{ color, weight: 4, opacity: 0.7, dashArray: '8 4' }}
              />
            )
          })}

          {/* ── Station markers (deduplicated) ── */}
          {(() => {
            // Build map: stationId → { station, routes: [{line, color, order, isTerminal}] }
            const stationMap = new Map<string, {
              lat: number; lng: number; name: string
              routes: { lineName: string; color: string; order: number; isTerminal: boolean }[]
            }>()

            ;(lines as Route[] ?? []).forEach((line, i) => {
              const color = LINE_COLORS[i % LINE_COLORS.length]
              const stations = line.routeStations ?? []
              stations.forEach((rs, idx) => {
                const entry = stationMap.get(rs.station.id) ?? {
                  lat: rs.station.lat, lng: rs.station.lng, name: rs.station.name, routes: [],
                }
                entry.routes.push({
                  lineName: line.name,
                  color,
                  order: rs.order,
                  isTerminal: idx === 0 || idx === stations.length - 1,
                })
                stationMap.set(rs.station.id, entry)
              })
            })

            return Array.from(stationMap.entries()).map(([id, st]) => {
              const shared  = st.routes.length > 1
              const terminal = st.routes.some((r) => r.isTerminal)
              const mainColor = st.routes[0].color

              return (
                <CircleMarker
                  key={id}
                  center={[st.lat, st.lng]}
                  radius={terminal ? 8 : shared ? 7 : 5}
                  pathOptions={{
                    color: shared ? '#ffffff' : mainColor,
                    fillColor: terminal ? mainColor : shared ? '#374151' : '#1f2937',
                    fillOpacity: 1,
                    weight: shared ? 2 : 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                    <div style={{ minWidth: 140 }}>
                      <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{st.name}</p>
                      {st.routes.map((r) => (
                        <p key={r.lineName} style={{ margin: '2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            display: 'inline-block', width: 10, height: 10,
                            borderRadius: '50%', background: r.color, flexShrink: 0,
                          }} />
                          <span style={{ color: r.color, fontWeight: 600 }}>{r.lineName}</span>
                          <span style={{ color: '#9ca3af' }}>· parada {r.order}</span>
                        </p>
                      ))}
                    </div>
                  </Tooltip>
                </CircleMarker>
              )
            })
          })()}

          {/* ── Bus markers ── */}
          {busesWithReport.map((bus: Bus) => {
            const r = bus.lastReport!
            const routeColor = bus.routeId ? (routeColorMap[bus.routeId] ?? '#6b7280') : '#6b7280'

            return (
              <Marker
                key={bus.id}
                position={[r.lat, r.lng]}
                icon={createBusIcon(r.occupancyLevel, bus.code, routeColor)}
                zIndexOffset={1000}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: 6 }}>
                      {bus.code} — {bus.plate}
                    </p>
                    <p>Ruta: <strong>{bus.route?.name ?? '—'}</strong></p>
                    <p>Ocupación: <strong>{r.occupancyPercent}%</strong></p>
                    <p>Pasajeros: {r.passengerCount} / {bus.capacity}</p>
                    {r.speed && <p>Velocidad: {r.speed} km/h</p>}
                    {bus.currentStation && bus.nextStation && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db', flexShrink: 0, display: 'inline-block' }} />
                          <span style={{ color: '#6b7280', fontSize: 11 }}>{bus.currentStation.name}</span>
                          <span style={{ color: bus.returning ? '#f97316' : '#2563eb', fontWeight: 700, fontSize: 11 }}>
                            {bus.returning ? '←' : '→'}
                          </span>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, display: 'inline-block' }} />
                          <strong style={{ color: '#111827', fontSize: 11 }}>{bus.nextStation.name}</strong>
                          {bus.etaMinutes != null && (
                            <span style={{
                              marginLeft: 'auto', background: bus.returning ? '#fff7ed' : '#eff6ff',
                              color: bus.returning ? '#f97316' : '#2563eb',
                              fontWeight: 700, fontSize: 11, padding: '2px 6px', borderRadius: 4,
                            }}>
                              {bus.etaMinutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {!loadingBuses && busesWithReport.length === 0 && (
        <div className="px-4 py-2 text-center text-slate-400 text-sm border-t border-slate-100">
          No hay buses con ubicación disponible — inicia la simulación
        </div>
      )}
    </div>
  )
}
