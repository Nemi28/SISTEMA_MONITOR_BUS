import { Request, Response } from 'express'
import * as busService from './bus.service'

export const getAll = async (req: Request, res: Response) => {
  try {
    const { filter } = req.query
    const buses = await busService.getAllBuses(filter as string)
    res.json({ success: true, data: buses })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener buses' })
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const bus = await busService.getBusById(req.params.id)
    if (!bus) return res.status(404).json({ success: false, message: 'Bus no encontrado' })
    res.json({ success: true, data: bus })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener bus' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { codigo, placa, capacidad, modelo, rutaId } = req.body
    if (!codigo || !placa || !capacidad) {
      return res.status(400).json({ success: false, message: 'codigo, placa y capacidad son requeridos' })
    }
    const bus = await busService.createBus({ codigo, placa, capacidad, modelo, rutaId })
    res.status(201).json({ success: true, data: bus })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Ya existe un bus con ese código o placa' })
    }
    res.status(500).json({ success: false, message: 'Error al crear bus' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const bus = await busService.updateBus(req.params.id, req.body)
    res.json({ success: true, data: bus })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar bus' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await busService.deleteBus(req.params.id)
    res.json({ success: true, message: 'Bus desactivado correctamente' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar bus' })
  }
}