import { Request, Response } from 'express'
import * as simulationService from './simulation.service'

export const start = async (req: Request, res: Response) => {
  try {
    const { intervalSeconds } = req.body
    const result = await simulationService.startSimulation(intervalSeconds || 5)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error starting simulation' })
  }
}

export const stop = async (_req: Request, res: Response) => {
  try {
    const result = simulationService.stopSimulation()
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error stopping simulation' })
  }
}

export const status = async (_req: Request, res: Response) => {
  try {
    const result = simulationService.getSimulationStatus()
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching simulation status' })
  }
}