# GrowMonitor — Sistema de Monitoreo de Flota

> Prueba técnica para **Grow Analytics**  
> Desarrollado por **Nemias del Aguila**

Sistema web MVP para el monitoreo en tiempo real de flotas de transporte público. Permite registrar buses, simular su ubicación GPS, visualizar su estado y ocupación, y gestionar la flota completa desde un panel de administración.

---

## ¿Qué hace el sistema?

- **Monitoreo en tiempo real** — cada bus activo genera un reporte de ubicación, velocidad y ocupación cada 5 segundos vía simulación automática
- **Mapa interactivo** — visualización de buses en movimiento sobre OpenStreetMap con identificación por código y color según nivel de ocupación
- **Dashboard de métricas** — total de buses, activos, llenos y ocupación promedio de la flota
- **Gestión completa** — CRUD de buses, líneas y estaciones con filtros, búsqueda en tiempo real y paginación
- **Historial de reportes** — consulta de reportes por bus ordenados por timestamp
- **Validaciones robustas** — capacidad máxima, campos requeridos, errores del servidor mostrados inline

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Backend | Node.js + Express + TypeScript + Prisma ORM |
| Base de datos | PostgreSQL 16 |
| Mapa | Leaflet + react-leaflet |
| Contenedor DB | Docker + docker-compose |

---

## Arquitectura

### Backend — módulo por dominio

```
backend/src/
├── buses/          # controller, service, routes
├── lines/          # controller, service, routes
├── stations/       # controller, service, routes
├── reports/        # controller, service, routes
├── simulation/     # motor de simulación GPS automático
├── middlewares/    # error handler global, 404
└── prisma/         # cliente singleton
```

### Frontend — componentes por vista

```
frontend/src/
├── components/     # BusCard, BusMap, BusList, Dashboard, ManagementPanel...
├── services/       # api.ts — todas las llamadas al backend centralizadas
├── hooks/          # usePolling — polling genérico con setInterval
└── types/          # interfaces TypeScript globales
```

### Base de datos

```
Route (línea)
 ├── name, description, origin, destination, active
 ├── tiene muchos RouteStation  (tabla pivote con orden)
 └── tiene muchos Bus

Station (parada)
 ├── name, lat, lng
 └── tiene muchos RouteStation

RouteStation (pivote Route ↔ Station)
 ├── routeId, stationId, order
 └── PK compuesta (routeId + stationId)

Bus
 ├── code (único), plate (único), capacity, model
 ├── status: ACTIVE | INACTIVE | MAINTENANCE  (soft-delete)
 ├── routeId nullable  (sin ruta → no se simula)
 └── tiene muchos Report

Report  (inmutable — nunca se sobreescribe)
 ├── lat, lng, speed, passengerCount
 ├── occupancyPercent (calculado en backend)
 └── occupancyLevel: LOW | MEDIUM | HIGH | FULL
```

### Flujo de datos

```
Simulación (cada 5s) → crea Reporte en PostgreSQL
Frontend (polling 5s) → consulta API REST → actualiza UI en tiempo real
```

---

## Requisitos previos

- Node.js >= 18
- Docker y Docker Compose
- npm

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Nemi28/SISTEMA_MONITOR_BUS.git
cd SISTEMA_MONITOR_BUS
```

### 2. Variables de entorno

**Backend** — crear `backend/.env` basado en `backend/.env.example`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sistema_bus"
PORT=3000
```

**Frontend** — crear `frontend/.env` basado en `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Instalar dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## Cómo levantar el proyecto

### Paso 1 — Levantar base de datos y backend con Docker

> Ejecutar desde la **raíz del proyecto** (donde está `docker-compose.yml`):

```bash
docker-compose up -d
```

Esto levanta PostgreSQL y el backend. Las migraciones se aplican automáticamente al iniciar el contenedor.

### Paso 2 — Aplicar migraciones (solo desarrollo local sin Docker)

Si prefieres correr el backend sin Docker:

```bash
cd backend
npx prisma migrate dev
```

### Paso 3 — Seed de datos (opcional)

Carga datos de ejemplo: 3 líneas, estaciones y 8 buses listos para simular.
Si prefieres iniciar con la base vacía y registrar todo desde la interfaz, omite este paso.

```bash
npm run seed
```

### Paso 4 — Iniciar el backend

```bash
cd backend
npm run dev
```

> El servidor corre en `http://localhost:3000`  
> Health check: `GET /health`

### Paso 5 — Iniciar el frontend

```bash
cd frontend
npm run dev
```

> La app corre en `http://localhost:5173`

### Paso 6 — Simulación

La simulación arranca automáticamente al iniciar el backend si existen buses activos con ruta asignada. El botón en la interfaz permite detenerla y reanudarla manualmente en cualquier momento.

---

## Decisiones técnicas

### Modelo de datos

Diseñé el esquema a partir de supuestos de negocio propios:

1. **Un bus pertenece a una sola ruta** — en el Metropolitano real cada unidad opera en un corredor fijo. Relación `Bus → Ruta` muchos-a-uno con `rutaId` nullable para buses sin asignación.

2. **Los reportes son inmutables** — cada snapshot de GPS y ocupación se inserta como nuevo registro. Nunca se sobrescribe. Esto garantiza historial completo y auditabilidad.

3. **El nivel de ocupación se calcula automáticamente en el backend** — BAJO ≤40%, MEDIO ≤70%, ALTO ≤99%, LLENO =100%. No lo ingresa el operador, elimina errores humanos.

4. **Buses con `rutaId = null` no se simulan** — un bus sin ruta asignada no tiene coordenadas de referencia. La simulación los ignora explícitamente.

5. **Soft delete en buses** — en lugar de eliminar físicamente, el bus cambia a estado INACTIVO o MANTENIMIENTO. Preserva el historial de reportes asociados.

### Arquitectura

**Módulo por dominio en el backend** — cada entidad tiene su propio `controller`, `service` y `routes`. El controller solo recibe, valida y responde. La lógica de negocio vive en el service. Las rutas se agregan en `routes/index.ts`.

**Singleton de Prisma** — un solo cliente compartido en toda la app evita abrir múltiples conexiones a la BD.

**Polling sobre WebSocket** — para el scope de este MVP, polling cada 5 segundos es suficiente y más simple de implementar y mantener. WebSocket agregaría complejidad innecesaria.

**Paginación en backend** — la búsqueda y el filtrado ocurren en PostgreSQL, no en el frontend. Así el sistema escala correctamente con cientos de buses.

### Stack

**PostgreSQL sobre MySQL** — soporte nativo de enums y mejor integración con Prisma para el esquema relacional que necesitaba.

**React con Vite sobre Create React App** — elegí React por experiencia y comodidad con el framework. Opté por Vite como bundler porque Create React App está oficialmente deprecado desde 2023 y ya no recibe mantenimiento. Vite arranca el servidor de desarrollo en menos de 1 segundo usando ES modules nativos del navegador, frente a los 10-30s de CRA en proyectos medianos.

**Prisma como ORM sobre TypeORM o SQL directo** — el schema de Prisma define tablas, relaciones y tipos en un solo archivo que actúa como fuente de verdad de la base de datos. Genera automáticamente el cliente TypeScript con autocompletado exacto de lo que devuelve cada query, y las migraciones se crean solas a partir de cambios en el schema. TypeORM y Sequelize requieren más configuración para el mismo resultado.

**Node/Express sobre NestJS** — dado el scope del MVP, Express es más directo y ligero. NestJS agrega estructura que no se justifica para este caso.

**UUID sobre ID autoincremental** — los IDs autoincrementales exponen el volumen de datos y son predecibles. UUID v4 es más seguro para una API pública.

---

## Endpoints

```
GET    /health                     — Estado del servidor
GET    /api/buses                  — Lista paginada (filtros: estado, línea, búsqueda, página)
POST   /api/buses                  — Crear bus
PUT    /api/buses/:id              — Actualizar bus (estado, línea asignada)
GET    /api/reports/last-status    — Último reporte de cada bus activo
GET    /api/reports/bus/:busId     — Historial de reportes por bus
POST   /api/reports                — Registrar reporte manual
GET    /api/lines                  — Lista de líneas con estaciones
POST   /api/lines                  — Crear línea
PUT    /api/lines/:id              — Actualizar línea
GET    /api/stations               — Estaciones por línea
POST   /api/stations               — Crear estación
POST   /api/simulation/start       — Iniciar simulación
POST   /api/simulation/stop        — Detener simulación
GET    /api/simulation/status      — Estado actual de la simulación
```

---

## Uso de IA

Herramienta utilizada: **Claude (Anthropic)** — Claude.ai + Claude Code

### Mi rol en el desarrollo

Fui el arquitecto y director técnico del proyecto. Tomé todas las decisiones de diseño, definí el modelo de datos, la estructura modular del backend, los endpoints, las validaciones de negocio y las features del frontend. Revisé, probé y corregí cada pieza de código antes de integrarla. Identifiqué bugs durante el desarrollo (coordenadas fuera de Lima, conflictos de puertos, buses sin ruta siendo simulados) y definí las soluciones.

### Lo que desarrollé directamente

- Modelo de datos completo: entidades, relaciones, enums, índices y constraints
- Arquitectura modular por dominio en el backend
- Todos los endpoints REST: rutas, controllers y services
- Validaciones de negocio: capacidad de pasajeros, estados de bus, reportes inmutables
- Filtros, paginación y búsqueda en backend
- Componentes del frontend: Dashboard, BusList, BusCard, ManagementPanel, BusForm, LineForm, ReportForm, BusHistory, SimulationPanel
- Hook `usePolling` para actualización automática del dashboard
- Sistema de filtros por estado, línea y búsqueda en tiempo real
- Docker Compose, migraciones Prisma y seed de datos
- Flujo completo de Git con feature branches por módulo

### Lo que fue asistido por IA

| Funcionalidad | Descripción |
|---|---|
| Motor de simulación GPS | Lógica de interpolación de coordenadas y generación de reportes automáticos |
| Visualización en mapa | Integración de Leaflet, marcadores dinámicos y popups |
| Hook de polling | Estructura base del `setInterval` con limpieza al desmontar |
| Sistema de notificaciones toast | Componente `Toaster` y hook `useToast` |

---

*GrowMonitor — 2026 · Nemias del Aguila*
