import { Request, Response } from 'express'
import * as reportService from './report.service'

export const create = async (req: Request, res: Response) => {
  try {
    const { busId, latitud, longitud, cantidadPasajeros, velocidad } = req.body

    if (!busId || latitud === undefined || longitud === undefined || cantidadPasajeros === undefined) {
      return res.status(400).json({
        success: false,
        message: 'busId, latitud, longitud y cantidadPasajeros son requeridos',
      })
    }

    const report = await reportService.createReport({
      busId,
      latitud,
      longitud,
      cantidadPasajeros,
      velocidad,
    })

    res.status(201).json({ success: true, data: report })
  } catch (error: any) {
    const status = error.status || 500
    const message = error.message || 'Error al crear reporte'
    res.status(status).json({ success: false, message })
  }
}

export const getByBus = async (req: Request, res: Response) => {
  try {
    const reports = await reportService.getReportsByBus(req.params.busId)
    res.json({ success: true, data: reports })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener historial' })
  }
}

export const getLastStatus = async (req: Request, res: Response) => {
  try {
    const status = await reportService.getLastStatusAllBuses()
    res.json({ success: true, data: status })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estados' })
  }
}