import { Request, Response } from 'express'
import * as stationService from './station.service'

export const getAll = async (_req: Request, res: Response) => {
  try {
    const stations = await stationService.getAllStations()
    res.json({ success: true, data: stations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stations' })
  }
}

export const getByLine = async (req: Request, res: Response) => {
  try {
    const stations = await stationService.getStationsByLine(req.params.routeId)
    res.json({ success: true, data: stations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stations' })
  }
}

export const getAvailableForRoute = async (req: Request, res: Response) => {
  try {
    const stations = await stationService.getAvailableForRoute(req.params.routeId)
    res.json({ success: true, data: stations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching available stations' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { name, lat, lng } = req.body
    const station = await stationService.createStation({ name, lat, lng })
    res.status(201).json({ success: true, data: station })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating station' })
  }
}

export const assign = async (req: Request, res: Response) => {
  try {
    const { routeId, order } = req.body
    const rs = await stationService.assignStation(req.params.id, routeId, order)
    res.json({ success: true, data: rs })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'La estación ya está asignada a esta ruta' })
    }
    res.status(500).json({ success: false, message: 'Error assigning station' })
  }
}

export const unassign = async (req: Request, res: Response) => {
  try {
    const { routeId } = req.body
    if (!routeId) {
      return res.status(400).json({ success: false, message: 'routeId is required' })
    }
    await stationService.unassignStation(req.params.id, routeId)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error unassigning station' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const station = await stationService.updateStation(req.params.id, req.body)
    res.json({ success: true, data: station })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating station' })
  }
}

export const reorder = async (req: Request, res: Response) => {
  try {
    const { routeId, order } = req.body
    const rs = await stationService.updateStationOrder(routeId, req.params.id, order)
    res.json({ success: true, data: rs })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating station order' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await stationService.deleteStation(req.params.id)
    res.json({ success: true, message: 'Station deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting station' })
  }
}
