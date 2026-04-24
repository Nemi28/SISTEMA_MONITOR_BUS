import { Router } from 'express'
import * as reportController from './report.controller'
import { validate } from '../middlewares/validate.middleware'
import { createReportSchema } from '../validators/report.validator'

const router = Router()

router.post('/', validate(createReportSchema), reportController.create)
router.get('/last-status', reportController.getLastStatus)
router.get('/bus/:busId', reportController.getByBus)

export default router
