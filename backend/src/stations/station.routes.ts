import { Router } from 'express'
import * as stationController from './station.controller'

const router = Router()

router.get('/lines/:lineId/stations', stationController.getByLine)
router.post('/', stationController.create)
router.put('/:id', stationController.update)
router.delete('/:id', stationController.remove)

export default router