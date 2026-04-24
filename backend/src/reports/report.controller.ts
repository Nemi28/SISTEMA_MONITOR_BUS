import { Request, Response } from 'express'
import * as reportService from './report.service'

export const create = async (req: Request, res: Response) => {
  try {
    const { busId, lat, lng, passengerCount, speed } = req.body
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
    const limit = Math.min(parseInt(String(req.query.limit ?? '50')), 100)
    const skip  = parseInt(String(req.query.skip  ?? '0'))
    const result = await reportService.getReportsByBus(req.params.busId, limit, skip)
    res.json({ success: true, ...result })
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
