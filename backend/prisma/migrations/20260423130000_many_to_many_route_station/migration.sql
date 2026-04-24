-- Create junction table
CREATE TABLE "RouteStation" (
  "routeId"   TEXT NOT NULL,
  "stationId" TEXT NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "RouteStation_pkey" PRIMARY KEY ("routeId", "stationId")
);

-- Migrate existing Station.routeId + Station.order → RouteStation
INSERT INTO "RouteStation" ("routeId", "stationId", "order")
SELECT "routeId", "id", "order"
FROM "Station"
WHERE "routeId" IS NOT NULL;

-- Add FK constraints
ALTER TABLE "RouteStation"
  ADD CONSTRAINT "RouteStation_routeId_fkey"
  FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RouteStation"
  ADD CONSTRAINT "RouteStation_stationId_fkey"
  FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index
CREATE INDEX "RouteStation_routeId_idx" ON "RouteStation"("routeId");

-- Drop routeId and order from Station
ALTER TABLE "Station" DROP CONSTRAINT IF EXISTS "Station_routeId_fkey";
DROP INDEX IF EXISTS "Station_routeId_idx";
ALTER TABLE "Station" DROP COLUMN IF EXISTS "routeId";
ALTER TABLE "Station" DROP COLUMN IF EXISTS "order";
