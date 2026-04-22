import { Router } from 'express'
import * as lineController from './line.controller'

const router = Router()

router.get('/', lineController.getAll)
router.get('/:id', lineController.getById)
router.post('/', lineController.create)
router.put('/:id', lineController.update)
router.delete('/:id', lineController.remove)

export default router