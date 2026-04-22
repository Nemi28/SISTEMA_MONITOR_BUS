import { Router } from 'express'
import lineRoutes from '../lines/line.routes'
import stationRoutes from '../stations/station.routes'
import busRoutes from '../buses/bus.routes'
import reportRoutes from '../reports/report.routes'


const router = Router()

router.use('/lines', lineRoutes)
router.use('/stations', stationRoutes)
router.use('/buses', busRoutes)
router.use('/reports', reportRoutes)

export default router