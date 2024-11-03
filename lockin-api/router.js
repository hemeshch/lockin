import { Router } from 'express'
import { getHome, createInitialTask, checkTask } from './controllers/taskController.js'

const router = Router()

router.get('/', getHome)
router.post('/initial', createInitialTask)
router.post('/check', checkTask)

export default router
