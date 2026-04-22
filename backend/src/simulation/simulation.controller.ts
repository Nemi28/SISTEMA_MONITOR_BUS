import { Request, Response } from 'express'
import * as simulationService from './simulation.service'

export const start = async (req: Request, res: Response) => {
  try {
    const { intervalSeconds } = req.body
    const result = await simulationService.startSimulation(intervalSeconds || 5)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al iniciar simulación' })
  }
}

export const stop = (req: Request, res: Response) => {
  try {
    const result = simulationService.stopSimulation()
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al detener simulación' })
  }
}

export const status = (req: Request, res: Response) => {
  try {
    const result = simulationService.getSimulationStatus()
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estado' })
  }
}