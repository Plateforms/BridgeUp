import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import { scheduleInterview, findInterviewById, listInterviews, updateInterview } from '../services/interview.service.js';
import { findApplicationById } from '../services/application.service.js';
import { notifyInterviewScheduled } from '../services/email.service.js';

const router = Router();
const createSchema = z.object({
  applicationId: z.coerce.number(),
  scheduledAt: z.string().datetime({ offset: true }),
  durationMinutes: z.coerce.number().optional(),
  meetingLink: z.string().optional(),
});

router.post('/', authenticate, requireRole('company', 'admin'), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const app = await findApplicationById(data.applicationId);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const interview = await scheduleInterview(data);
    notifyInterviewScheduled(app.student.email, app.student.name, app.internship?.title, data.scheduledAt, data.meetingLink)
      .catch(() => {});

    res.status(201).json(interview);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const filters = {};
    if (req.user.role === 'company') filters.companyId = req.user.id;
    if (req.user.role === 'student') filters.studentId = req.user.id;
    if (req.query.applicationId) filters.applicationId = parseInt(req.query.applicationId);
    const result = await listInterviews({ ...filters, page, limit });
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const interview = await findInterviewById(parseInt(req.params.id));
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json(interview);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, requireRole('company', 'admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = createSchema.partial().parse(req.body);
    const interview = await updateInterview(id, data);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json(interview);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    next(err);
  }
});

export default router;
