-- Make routeId nullable on Station
ALTER TABLE "Station" ALTER COLUMN "routeId" DROP NOT NULL;

-- Drop old unique constraint (routeId + order), no longer needed as global pool
ALTER TABLE "Station" DROP CONSTRAINT IF EXISTS "Station_routeId_order_key";

-- Update FK to SET NULL on delete
ALTER TABLE "Station" DROP CONSTRAINT "Station_routeId_fkey";
ALTER TABLE "Station" ADD CONSTRAINT "Station_routeId_fkey"
  FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
