import { Request, Response } from 'express'
import * as busService from './bus.service'

export const getAll = async (req: Request, res: Response) => {
  try {
    const { filter, routeId, search, page, limit } = req.query
    const result = await busService.getAllBuses(
      filter as string,
      routeId as string,
      search as string,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 9
    )
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching buses' })
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const bus = await busService.getBusById(req.params.id)
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' })
    res.json({ success: true, data: bus })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bus' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { code, plate, capacity, model, routeId } = req.body
    if (!code || !plate || !capacity) {
      return res.status(400).json({ success: false, message: 'code, plate, and capacity are required' })
    }
    const bus = await busService.createBus({ code, plate, capacity, model, routeId })
    res.status(201).json({ success: true, data: bus })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'A bus with that code or plate already exists' })
    }
    res.status(500).json({ success: false, message: 'Error creating bus' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const bus = await busService.updateBus(req.params.id, req.body)
    res.json({ success: true, data: bus })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating bus' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await busService.deleteBus(req.params.id)
    res.json({ success: true, message: 'Bus deactivated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting bus' })
  }
}
