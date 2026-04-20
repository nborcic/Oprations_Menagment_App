import { Router } from 'express';
import { login, getMe, listStaff } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// /login is intentionally public — no authenticate middleware.
router.post('/login', login);
// /me re-validates the token and returns fresh user data (role may have changed since token was issued).
router.get('/me', authenticate, getMe);
router.get('/staff', authenticate, listStaff);

export default router;
