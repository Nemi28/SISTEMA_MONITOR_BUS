import { Router } from 'express'
import * as busController from './bus.controller'

const router = Router()

router.get('/', busController.getAll)
router.get('/:id', busController.getById)
router.post('/', busController.create)
router.put('/:id', busController.update)
router.delete('/:id', busController.remove)

export default router