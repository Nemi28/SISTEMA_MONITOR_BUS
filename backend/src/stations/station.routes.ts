import { Router } from 'express'
import * as stationController from './station.controller'
import { validate } from '../middlewares/validate.middleware'
import { createStationSchema, updateStationSchema, assignStationSchema } from '../validators/station.validator'

const router = Router()

router.get('/', stationController.getAll)
router.get('/available/:routeId', stationController.getAvailableForRoute)
router.get('/:routeId', stationController.getByLine)
router.post('/', validate(createStationSchema), stationController.create)
router.patch('/:id/assign', validate(assignStationSchema), stationController.assign)
router.patch('/:id/unassign', stationController.unassign)
router.patch('/:id/reorder', validate(assignStationSchema), stationController.reorder)
router.put('/:id', validate(updateStationSchema), stationController.update)
router.delete('/:id', stationController.remove)

export default router
