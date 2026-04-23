-- Rename enum values: BusEstado
ALTER TYPE "BusEstado" RENAME VALUE 'ACTIVO' TO 'ACTIVE';
ALTER TYPE "BusEstado" RENAME VALUE 'INACTIVO' TO 'INACTIVE';
ALTER TYPE "BusEstado" RENAME VALUE 'MANTENIMIENTO' TO 'MAINTENANCE';

-- Rename enum values: NivelOcupacion
ALTER TYPE "NivelOcupacion" RENAME VALUE 'BAJO' TO 'LOW';
ALTER TYPE "NivelOcupacion" RENAME VALUE 'MEDIO' TO 'MEDIUM';
ALTER TYPE "NivelOcupacion" RENAME VALUE 'ALTO' TO 'HIGH';
ALTER TYPE "NivelOcupacion" RENAME VALUE 'LLENO' TO 'FULL';

-- Rename enum types
ALTER TYPE "BusEstado" RENAME TO "BusStatus";
ALTER TYPE "NivelOcupacion" RENAME TO "OccupancyLevel";

-- Rename columns in Ruta
ALTER TABLE "Ruta" RENAME COLUMN "nombre" TO "name";
ALTER TABLE "Ruta" RENAME COLUMN "descripcion" TO "description";
ALTER TABLE "Ruta" RENAME COLUMN "origen" TO "origin";
ALTER TABLE "Ruta" RENAME COLUMN "destino" TO "destination";
ALTER TABLE "Ruta" RENAME COLUMN "activa" TO "active";

-- Rename Ruta table
ALTER TABLE "Ruta" RENAME TO "Route";

-- Rename columns in Estacion
ALTER TABLE "Estacion" RENAME COLUMN "rutaId" TO "routeId";
ALTER TABLE "Estacion" RENAME COLUMN "nombre" TO "name";
ALTER TABLE "Estacion" RENAME COLUMN "latitud" TO "lat";
ALTER TABLE "Estacion" RENAME COLUMN "longitud" TO "lng";
ALTER TABLE "Estacion" RENAME COLUMN "orden" TO "order";

-- Rename Estacion table
ALTER TABLE "Estacion" RENAME TO "Station";

-- Rename columns in Bus
ALTER TABLE "Bus" RENAME COLUMN "rutaId" TO "routeId";
ALTER TABLE "Bus" RENAME COLUMN "codigo" TO "code";
ALTER TABLE "Bus" RENAME COLUMN "placa" TO "plate";
ALTER TABLE "Bus" RENAME COLUMN "capacidad" TO "capacity";
ALTER TABLE "Bus" RENAME COLUMN "modelo" TO "model";
ALTER TABLE "Bus" RENAME COLUMN "estado" TO "status";

-- Rename columns in Reporte
ALTER TABLE "Reporte" RENAME COLUMN "latitud" TO "lat";
ALTER TABLE "Reporte" RENAME COLUMN "longitud" TO "lng";
ALTER TABLE "Reporte" RENAME COLUMN "cantidadPasajeros" TO "passengerCount";
ALTER TABLE "Reporte" RENAME COLUMN "velocidad" TO "speed";
ALTER TABLE "Reporte" RENAME COLUMN "porcentajeOcupacion" TO "occupancyPercent";
ALTER TABLE "Reporte" RENAME COLUMN "nivelOcupacion" TO "occupancyLevel";

-- Rename Reporte table
ALTER TABLE "Reporte" RENAME TO "Report";

-- Rename indexes
ALTER INDEX "Ruta_nombre_key" RENAME TO "Route_name_key";
ALTER INDEX "Estacion_rutaId_idx" RENAME TO "Station_routeId_idx";
ALTER INDEX "Estacion_rutaId_orden_key" RENAME TO "Station_routeId_order_key";
ALTER INDEX "Bus_codigo_key" RENAME TO "Bus_code_key";
ALTER INDEX "Bus_placa_key" RENAME TO "Bus_plate_key";
ALTER INDEX "Reporte_busId_idx" RENAME TO "Report_busId_idx";
ALTER INDEX "Reporte_timestamp_idx" RENAME TO "Report_timestamp_idx";

-- Rename primary key constraints
ALTER TABLE "Route" RENAME CONSTRAINT "Ruta_pkey" TO "Route_pkey";
ALTER TABLE "Station" RENAME CONSTRAINT "Estacion_pkey" TO "Station_pkey";
ALTER TABLE "Report" RENAME CONSTRAINT "Reporte_pkey" TO "Report_pkey";

-- Rename foreign key constraints
ALTER TABLE "Station" RENAME CONSTRAINT "Estacion_rutaId_fkey" TO "Station_routeId_fkey";
ALTER TABLE "Bus" RENAME CONSTRAINT "Bus_rutaId_fkey" TO "Bus_routeId_fkey";
ALTER TABLE "Report" RENAME CONSTRAINT "Reporte_busId_fkey" TO "Report_busId_fkey";
