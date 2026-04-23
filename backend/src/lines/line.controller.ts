import { Request, Response } from 'express'
import * as lineService from './line.service'

export const getAll = async (req: Request, res: Response) => {
  try {
    const lines = await lineService.getAllLines()
    res.json({ success: true, data: lines })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching routes' })
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const line = await lineService.getLineById(req.params.id)
    if (!line) return res.status(404).json({ success: false, message: 'Route not found' })
    res.json({ success: true, data: line })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching route' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { name, description, origin, destination } = req.body
    if (!name || !origin || !destination) {
      return res.status(400).json({ success: false, message: 'name, origin, and destination are required' })
    }
    const line = await lineService.createLine({ name, description, origin, destination })
    res.status(201).json({ success: true, data: line })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'A route with that name already exists' })
    }
    res.status(500).json({ success: false, message: 'Error creating route' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const line = await lineService.updateLine(req.params.id, req.body)
    res.json({ success: true, data: line })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating route' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await lineService.deleteLine(req.params.id)
    res.json({ success: true, message: 'Route deactivated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting route' })
  }
}
