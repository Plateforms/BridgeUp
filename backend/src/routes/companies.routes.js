import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const companies = await prisma.user.findMany({
      where: { role: 'company' },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        createdAt: true,
        ratings: { select: { rating: true } },
        _count: { select: { ratings: true } },
      },
      orderBy: { name: 'asc' },
    });

    const result = companies.map(c => {
      const sum = c.ratings.reduce((a, r) => a + r.rating, 0);
      const avg = c.ratings.length > 0 ? (sum / c.ratings.length).toFixed(1) : null;
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        company_name: c.companyName,
        created_at: c.createdAt,
        avg_rating: avg ? parseFloat(avg) : null,
        rating_count: c._count.ratings,
      };
    });

    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const company = await prisma.user.findFirst({
      where: { id: parseInt(req.params.id), role: 'company' },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        createdAt: true,
        ratings: { select: { rating: true } },
        _count: { select: { ratings: true } },
      },
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const sum = company.ratings.reduce((a, r) => a + r.rating, 0);
    const avg = company.ratings.length > 0 ? (sum / company.ratings.length).toFixed(1) : null;

    res.json({
      id: company.id,
      name: company.name,
      email: company.email,
      company_name: company.companyName,
      created_at: company.createdAt,
      avg_rating: avg ? parseFloat(avg) : null,
      rating_count: company._count.ratings,
    });
  } catch (err) { next(err); }
});

export default router;
