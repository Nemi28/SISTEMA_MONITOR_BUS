import { Request, Response } from 'express'
import * as lineService from './line.service'

export const getAll = async (_req: Request, res: Response) => {
  try {
    const lines = await lineService.getAllLines()
    res.json({ success: true, data: lines })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener las líneas' })
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const line = await lineService.getLineById(req.params.id)
    if (!line) return res.status(404).json({ success: false, message: 'Línea no encontrada' })
    res.json({ success: true, data: line })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la línea' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { name, description, origin, destination } = req.body
    const line = await lineService.createLine({ name, description, origin: origin ?? '', destination: destination ?? '' })
    res.status(201).json({ success: true, data: line })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Ya existe una línea con ese nombre' })
    }
    res.status(500).json({ success: false, message: 'Error al crear la línea' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const line = await lineService.updateLine(req.params.id, req.body)
    res.json({ success: true, data: line })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar la línea' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await lineService.deleteLine(req.params.id)
    res.json({ success: true, message: 'Línea desactivada correctamente' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la línea' })
  }
}
