import prisma from "../prisma/prisma.service";

const BASE_LAT = -12.0464;
const BASE_LNG = -77.0428;

let simulationInterval: NodeJS.Timeout | null = null;
let isRunning = false;

const getRandomOffset = () => (Math.random() - 0.5) * 0.01;
const getRandomSpeed = () => Math.round(Math.random() * 60 + 10);

const calculateLevel = (percent: number) => {
  if (percent <= 40) return "LOW";
  if (percent <= 70) return "MEDIUM";
  if (percent <= 99) return "HIGH";
  return "FULL";
};

const generateReportForBus = async (bus: any) => {
  if (!bus.routeId) return;

  const lastReport = await prisma.report.findFirst({
    where: { busId: bus.id },
    orderBy: { timestamp: "desc" },
  });

  const lat = lastReport
    ? lastReport.lat + getRandomOffset() * 0.3
    : BASE_LAT + getRandomOffset();

  const lng = lastReport
    ? lastReport.lng + getRandomOffset() * 0.3
    : BASE_LNG + getRandomOffset();

  const lastPassengerCount =
    lastReport?.passengerCount ?? Math.floor(bus.capacity * 0.3);
  const variation = Math.floor((Math.random() - 0.5) * 15);
  const passengerCount = Math.min(
    bus.capacity,
    Math.max(0, lastPassengerCount + variation),
  );

  const occupancyPercent = Math.round((passengerCount / bus.capacity) * 100);
  const occupancyLevel = calculateLevel(occupancyPercent) as any;

  await prisma.report.create({
    data: {
      busId: bus.id,
      lat,
      lng,
      passengerCount,
      speed: getRandomSpeed(),
      occupancyPercent,
      occupancyLevel,
    },
  });
};

export const startSimulation = async (intervalSeconds: number = 5) => {
  if (isRunning) {
    return { message: "Simulation already running" };
  }

  const buses = await prisma.bus.findMany({
    where: { status: "ACTIVE", routeId: { not: null } },
  });

  if (buses.length === 0) {
    return { message: "No active buses to simulate" };
  }

  isRunning = true;

  for (const bus of buses) {
    await generateReportForBus(bus);
  }

  simulationInterval = setInterval(async () => {
    const activeBuses = await prisma.bus.findMany({
      where: { status: "ACTIVE" },
    });
    for (const bus of activeBuses) {
      await generateReportForBus(bus);
    }
  }, intervalSeconds * 1000);

  return {
    message: `Simulation started for ${buses.length} bus(es) every ${intervalSeconds} seconds`,
  };
};

export const stopSimulation = () => {
  if (!isRunning) {
    return { message: "No simulation running" };
  }

  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }

  isRunning = false;
  return { message: "Simulation stopped" };
};

export const getSimulationStatus = () => ({
  isRunning,
  message: isRunning ? "Simulation running" : "Simulation stopped",
});
