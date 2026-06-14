import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import logger from '../config/logger.js';

const router = Router();

router.get('/users', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    const users = await prisma.user.findMany({
      where,
      select: { id: true, email: true, role: true, name: true, companyName: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users.map(u => ({ ...u, company_name: u.companyName, created_at: u.createdAt, companyName: undefined, createdAt: undefined })));
  } catch (err) { next(err); }
});

router.put('/users/:id/role', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'company', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { role } });
    logger.info('User role updated', { userId: req.params.id, role });
    res.json({ message: 'Role updated' });
  } catch (err) { next(err); }
});

router.delete('/users/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);
    if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await prisma.user.delete({ where: { id: targetId } });
    logger.info('User deleted by admin', { targetId, adminId: req.user.id });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
});

router.get('/stats', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const [users, internships, applications, interviews, ratings] = await Promise.all([
      prisma.user.count(),
      prisma.internship.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.companyRating.count(),
    ]);
    res.json({ users, internships, applications, interviews, ratings });
  } catch (err) { next(err); }
});

export default router;
