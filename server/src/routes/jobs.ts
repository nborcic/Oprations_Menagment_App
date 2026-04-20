import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { list, get, create, update, remove, createNote, stats, activity } from '../controllers/jobController.js';

const router = Router();

router.use(authenticate);
router.get('/stats', stats);
router.get('/activity', activity);
router.get('/', list);
router.get('/:id', get);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/notes', createNote);

export default router;
