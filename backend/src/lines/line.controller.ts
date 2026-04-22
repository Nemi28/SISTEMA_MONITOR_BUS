import { Request, Response } from 'express'
import * as lineService from './line.service'

export const getAll = async (req: Request, res: Response) => {
  try {
    const lines = await lineService.getAllLines()
    res.json({ success: true, data: lines })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener rutas' })
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const line = await lineService.getLineById(req.params.id)
    if (!line) return res.status(404).json({ success: false, message: 'Ruta no encontrada' })
    res.json({ success: true, data: line })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener ruta' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, origen, destino } = req.body
    if (!nombre || !origen || !destino) {
      return res.status(400).json({ success: false, message: 'nombre, origen y destino son requeridos' })
    }
    const line = await lineService.createLine({ nombre, descripcion, origen, destino })
    res.status(201).json({ success: true, data: line })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Ya existe una ruta con ese nombre' })
    }
    res.status(500).json({ success: false, message: 'Error al crear ruta' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const line = await lineService.updateLine(req.params.id, req.body)
    res.json({ success: true, data: line })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar ruta' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await lineService.deleteLine(req.params.id)
    res.json({ success: true, message: 'Ruta desactivada correctamente' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar ruta' })
  }
}