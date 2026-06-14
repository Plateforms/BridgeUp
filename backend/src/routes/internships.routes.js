import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createInternship, findInternshipById, listInternships, updateInternship, deleteInternship } from '../services/internship.service.js';

const router = Router();
const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requirements: z.string().optional(),
  location: z.string().optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const result = await listInternships({ activeOnly: !req.user || req.user.role !== 'admin', q: req.query.q, page, limit });
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const internship = await findInternshipById(parseInt(req.params.id));
    if (!internship) return res.status(404).json({ error: 'Internship not found' });
    res.json(internship);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireRole('company', 'admin'), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const internship = await createInternship({
      companyId: req.user.role === 'company' ? req.user.id : (req.body.companyId || req.user.id),
      ...data,
    });
    res.status(201).json(internship);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    next(err);
  }
});

router.put('/:id', authenticate, requireRole('company', 'admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await findInternshipById(id);
    if (!existing) return res.status(404).json({ error: 'Internship not found' });
    if (req.user.role !== 'admin' && existing.company_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own internships' });
    }
    const data = createSchema.partial().parse(req.body);
    const internship = await updateInternship(id, data);
    res.json(internship);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    next(err);
  }
});

router.delete('/:id', authenticate, requireRole('company', 'admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await findInternshipById(id);
    if (!existing) return res.status(404).json({ error: 'Internship not found' });
    if (req.user.role !== 'admin' && existing.company_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own internships' });
    }
    await deleteInternship(id);
    res.json({ message: 'Internship deleted' });
  } catch (err) { next(err); }
});

export default router;
