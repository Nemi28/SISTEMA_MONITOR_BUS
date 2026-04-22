import { Router } from 'express'
import lineRoutes from '../lines/line.routes'
import stationRoutes from '../stations/station.routes'
import busRoutes from '../buses/bus.routes'

const router = Router()

router.use('/lines', lineRoutes)
router.use('/stations', stationRoutes)
router.use('/buses', busRoutes)

export default router