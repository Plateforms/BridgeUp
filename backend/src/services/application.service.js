import prisma from '../lib/prisma.js';
import logger from '../config/logger.js';

export async function createApplication({ internshipId, studentId, coverLetter, cvS3Key, extractedText }) {
  const existing = await prisma.application.findFirst({
    where: { internshipId, studentId },
  });
  if (existing) throw Object.assign(new Error('You have already applied to this internship'), { status: 409 });

  const app = await prisma.application.create({
    data: {
      internshipId,
      studentId,
      coverLetter: coverLetter || null,
      cvS3Key: cvS3Key || null,
      extractedText: extractedText || null,
      status: 'pending',
    },
  });
  logger.info('Application created', { id: app.id, internshipId, studentId });
  return findApplicationById(app.id);
}

export async function findApplicationById(id) {
  const row = await prisma.application.findUnique({
    where: { id },
    include: {
      internship: true,
      student: { select: { id: true, name: true, email: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    internship_id: row.internshipId,
    student_id: row.studentId,
    status: row.status,
    cover_letter: row.coverLetter,
    cv_s3_key: row.cvS3Key,
    extracted_text: row.extractedText,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    internship: row.internship,
    student: row.student,
  };
}

export async function listApplications({ studentId, companyId, internshipId, status, page = 1, limit = 20 } = {}) {
  const where = {};
  if (studentId) where.studentId = studentId;
  if (internshipId) where.internshipId = internshipId;
  if (status) where.status = status;
  if (companyId) where.internship = { companyId };

  const [rows, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        internship: { select: { title: true, companyId: true } },
        student: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.application.count({ where }),
  ]);

  return {
    data: rows.map(row => ({
      id: row.id,
      internship_id: row.internshipId,
      student_id: row.studentId,
      status: row.status,
      cover_letter: row.coverLetter,
      cv_s3_key: row.cvS3Key,
      extracted_text: row.extractedText,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
      internship_title: row.internship.title,
      student_name: row.student.name,
      student_email: row.student.email,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateApplicationStatus(id, status) {
  await prisma.application.update({ where: { id }, data: { status } });
  logger.info('Application status updated', { id, status });
  return findApplicationById(id);
}
