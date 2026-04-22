import { Router } from 'express'
import * as reportController from './report.controller'

const router = Router()

router.post('/', reportController.create)
router.get('/last-status', reportController.getLastStatus)
router.get('/bus/:busId', reportController.getByBus)

export default router