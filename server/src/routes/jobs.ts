import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { list, get, create, update, remove, createNote, stats, activity } from '../controllers/jobController.js';

const router = Router();

router.use(authenticate);
// /stats and /activity must be declared before /:id — otherwise Express matches
// the literal strings "stats" and "activity" as the :id param instead.
router.get('/stats', stats);
router.get('/activity', activity);
router.get('/', list);
router.get('/:id', get);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/notes', createNote);

export default router;
