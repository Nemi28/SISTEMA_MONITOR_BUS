import { Router } from 'express'
import * as lineController from './line.controller'
import { validate } from '../middlewares/validate.middleware'
import { createLineSchema, updateLineSchema } from '../validators/line.validator'

const router = Router()

router.get('/', lineController.getAll)
router.get('/:id', lineController.getById)
router.post('/', validate(createLineSchema), lineController.create)
router.put('/:id', validate(updateLineSchema), lineController.update)
router.delete('/:id', lineController.remove)

export default router
