import { Request, Response } from 'express'
import * as stationService from './station.service'

export const getByLine = async (req: Request, res: Response) => {
  try {
    const stations = await stationService.getStationsByLine(req.params.lineId)
    res.json({ success: true, data: stations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estaciones' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { rutaId, nombre, latitud, longitud, orden } = req.body
    if (!rutaId || !nombre || !latitud || !longitud || !orden) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' })
    }
    const station = await stationService.createStation({ rutaId, nombre, latitud, longitud, orden })
    res.status(201).json({ success: true, data: station })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Ya existe una estación con ese orden en esta ruta' })
    }
    res.status(500).json({ success: false, message: 'Error al crear estación' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const station = await stationService.updateStation(req.params.id, req.body)
    res.json({ success: true, data: station })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar estación' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await stationService.deleteStation(req.params.id)
    res.json({ success: true, message: 'Estación eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar estación' })
  }
}