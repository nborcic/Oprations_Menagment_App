import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { list, get, create, update, remove } from '../controllers/customerController.js';

const router = Router();

// Apply auth to every route in this file at once instead of repeating it per handler.
router.use(authenticate);
router.get('/', list);
router.get('/:id', get);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
