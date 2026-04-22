-- CreateEnum
CREATE TYPE "BusEstado" AS ENUM ('ACTIVO', 'INACTIVO', 'MANTENIMIENTO');

-- CreateEnum
CREATE TYPE "NivelOcupacion" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'LLENO');

-- CreateTable
CREATE TABLE "Ruta" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estacion" (
    "id" TEXT NOT NULL,
    "rutaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "orden" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" TEXT NOT NULL,
    "rutaId" TEXT,
    "codigo" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "modelo" TEXT,
    "estado" "BusEstado" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "cantidadPasajeros" INTEGER NOT NULL,
    "velocidad" DOUBLE PRECISION,
    "porcentajeOcupacion" DOUBLE PRECISION NOT NULL,
    "nivelOcupacion" "NivelOcupacion" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ruta_nombre_key" ON "Ruta"("nombre");

-- CreateIndex
CREATE INDEX "Estacion_rutaId_idx" ON "Estacion"("rutaId");

-- CreateIndex
CREATE UNIQUE INDEX "Estacion_rutaId_orden_key" ON "Estacion"("rutaId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_codigo_key" ON "Bus"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_placa_key" ON "Bus"("placa");

-- CreateIndex
CREATE INDEX "Reporte_busId_idx" ON "Reporte"("busId");

-- CreateIndex
CREATE INDEX "Reporte_timestamp_idx" ON "Reporte"("timestamp");

-- AddForeignKey
ALTER TABLE "Estacion" ADD CONSTRAINT "Estacion_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
