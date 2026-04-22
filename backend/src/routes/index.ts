import { Router } from 'express'
import lineRoutes from '../lines/line.routes'
import stationRoutes from '../stations/station.routes'

const router = Router()

router.use('/lines', lineRoutes)
router.use('/stations', stationRoutes)

export default router