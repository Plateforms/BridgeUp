import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import { registerUser, loginUser, getUserById } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validators.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    next(err);
  }
});

router.post('/register-admin', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const data = registerSchema.parse({ ...req.body, role: 'admin' });
    const user = await registerUser({ ...data, role: 'admin' });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
