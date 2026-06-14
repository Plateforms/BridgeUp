import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createApplication, findApplicationById, listApplications, updateApplicationStatus,
} from '../services/application.service.js';
import { notifyApplicationReceived, notifyStatusChange } from '../services/email.service.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.post('/', authenticate, requireRole('student'), async (req, res, next) => {
  try {
    const { internshipId, coverLetter, cvS3Key, extractedText } = req.body;
    if (!internshipId) return res.status(400).json({ error: 'internshipId is required' });
    const application = await createApplication({
      internshipId, studentId: req.user.id, coverLetter, cvS3Key, extractedText,
    });
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: { company: { select: { name: true } } },
    });
    if (internship) {
      notifyApplicationReceived(req.user.email, req.user.name, internship.title, internship.company.name)
        .catch(() => {});
    }
    res.status(201).json(application);
  } catch (err) { next(err); }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const filters = {};
    if (req.user.role === 'student') filters.studentId = req.user.id;
    if (req.user.role === 'company') filters.companyId = req.user.id;
    if (req.query.internshipId) filters.internshipId = parseInt(req.query.internshipId);
    if (req.query.status) filters.status = req.query.status;
    const result = await listApplications({ ...filters, page, limit });
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const app = await findApplicationById(parseInt(req.params.id));
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (req.user.role === 'student' && app.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(app);
  } catch (err) { next(err); }
});

router.put('/:id/status', authenticate, requireRole('company', 'admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const app = await findApplicationById(id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    const updated = await updateApplicationStatus(id, status);
    if (app.student) {
      notifyStatusChange(app.student.email, app.student.name, app.internship?.title, status)
        .catch(() => {});
    }
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
