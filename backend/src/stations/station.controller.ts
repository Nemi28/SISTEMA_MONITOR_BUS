import { Request, Response } from 'express'
import * as stationService from './station.service'

export const getByLine = async (req: Request, res: Response) => {
  try {
    const stations = await stationService.getStationsByLine(req.params.lineId)
    res.json({ success: true, data: stations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stations' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { routeId, name, lat, lng, order } = req.body
    if (!routeId || !name || lat === undefined || lng === undefined || order === undefined) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }
    const station = await stationService.createStation({ routeId, name, lat, lng, order })
    res.status(201).json({ success: true, data: station })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'A station with that order already exists on this route' })
    }
    res.status(500).json({ success: false, message: 'Error creating station' })
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

export const remove = async (req: Request, res: Response) => {
  try {
    await stationService.deleteStation(req.params.id)
    res.json({ success: true, message: 'Station deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting station' })
  }
}
