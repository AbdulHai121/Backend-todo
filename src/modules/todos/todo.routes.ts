
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import * as controller from './todo.controller';

const router = Router();

router.get('/', authMiddleware, controller.getTodo);
router.post('/', authMiddleware, controller.createTodo);
router.put('/:id', authMiddleware, controller.updateTodo);
router.delete('/:id', authMiddleware, controller.deleteTodo);

export default router;
