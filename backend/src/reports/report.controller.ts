import { Request, Response } from 'express'
import * as reportService from './report.service'

export const create = async (req: Request, res: Response) => {
  try {
    const { busId, lat, lng, passengerCount, speed } = req.body

    if (!busId || lat === undefined || lng === undefined || passengerCount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'busId, lat, lng, and passengerCount are required',
      })
    }

    const report = await reportService.createReport({ busId, lat, lng, passengerCount, speed })
    res.status(201).json({ success: true, data: report })
  } catch (error: any) {
    const status = error.status || 500
    const message = error.message || 'Error creating report'
    res.status(status).json({ success: false, message })
  }
}

export const getByBus = async (req: Request, res: Response) => {
  try {
    const reports = await reportService.getReportsByBus(req.params.busId)
    res.json({ success: true, data: reports })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching report history' })
  }
}

export const getLastStatus = async (req: Request, res: Response) => {
  try {
    const status = await reportService.getLastStatusAllBuses()
    res.json({ success: true, data: status })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching status' })
  }
}
