import { Router } from 'express'
import * as busController from './bus.controller'
import { validate } from '../middlewares/validate.middleware'
import { createBusSchema, updateBusSchema } from '../validators/bus.validator'

const router = Router()

router.get('/', busController.getAll)
router.get('/:id', busController.getById)
router.post('/', validate(createBusSchema), busController.create)
router.put('/:id', validate(updateBusSchema), busController.update)
router.delete('/:id', busController.remove)

export default router
