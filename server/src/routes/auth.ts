import { Router } from 'express';
import { login, getMe, listStaff } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/staff', authenticate, listStaff);

export default router;
