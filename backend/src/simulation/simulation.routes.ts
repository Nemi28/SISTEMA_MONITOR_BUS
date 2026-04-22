import { Router } from 'express'
import * as simulationController from './simulation.controller'

const router = Router()

router.post('/start', simulationController.start)
router.post('/stop', simulationController.stop)
router.get('/status', simulationController.status)

export default router