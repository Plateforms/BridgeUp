import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import logger from '../config/logger.js';

const router = Router();
const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional(),
});

router.post('/:id/ratings', authenticate, requireRole('student'), async (req, res, next) => {
  try {
    const { rating, review } = ratingSchema.parse(req.body);
    const companyId = parseInt(req.params.id);

    const company = await prisma.user.findFirst({ where: { id: companyId, role: 'company' } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const existing = await prisma.companyRating.findUnique({
      where: { companyId_studentId: { companyId, studentId: req.user.id } },
    });
    if (existing) return res.status(409).json({ error: 'You have already rated this company' });

    await prisma.companyRating.create({ data: { companyId, studentId: req.user.id, rating, review } });
    logger.info('Company rated', { companyId, studentId: req.user.id, rating });
    res.status(201).json({ message: 'Rating submitted' });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    next(err);
  }
});

router.get('/:id/ratings', async (req, res, next) => {
  try {
    const ratings = await prisma.companyRating.findMany({
      where: { companyId: parseInt(req.params.id) },
      include: { student: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(ratings.map(r => ({
      id: r.id,
      company_id: r.companyId,
      student_id: r.studentId,
      rating: r.rating,
      review: r.review,
      created_at: r.createdAt,
      student_name: r.student.name,
    })));
  } catch (err) { next(err); }
});

export default router;
