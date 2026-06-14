import prisma from '../lib/prisma.js';
import logger from '../config/logger.js';

export async function scheduleInterview({ applicationId, scheduledAt, durationMinutes, meetingLink }) {
  const interview = await prisma.interview.create({
    data: {
      applicationId,
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 60,
      meetingLink: meetingLink || null,
      status: 'scheduled',
    },
  });
  logger.info('Interview scheduled', { id: interview.id, applicationId });
  return findInterviewById(interview.id);
}

export async function findInterviewById(id) {
  const row = await prisma.interview.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          internship: true,
          student: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    application_id: row.applicationId,
    scheduled_at: row.scheduledAt,
    duration_minutes: row.durationMinutes,
    meeting_link: row.meetingLink,
    status: row.status,
    notes: row.notes,
    created_at: row.createdAt,
    application: row.application,
    internship: row.application.internship,
    student: row.application.student,
  };
}

export async function listInterviews({ companyId, studentId, applicationId, page = 1, limit = 20 } = {}) {
  const where = {};
  if (applicationId) where.applicationId = applicationId;
  if (companyId || studentId) {
    where.application = {};
    if (companyId) where.application.internship = { companyId };
    if (studentId) where.application.studentId = studentId;
  }

  const [rows, total] = await Promise.all([
    prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            internship: { select: { title: true } },
            student: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.interview.count({ where }),
  ]);

  return {
    data: rows.map(row => ({
      id: row.id,
      application_id: row.applicationId,
      scheduled_at: row.scheduledAt,
      duration_minutes: row.durationMinutes,
      meeting_link: row.meetingLink,
      status: row.status,
      notes: row.notes,
      created_at: row.createdAt,
      internship_title: row.application.internship.title,
      student_name: row.application.student.name,
      student_email: row.application.student.email,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateInterview(id, data) {
  const updateData = {};
  if (data.scheduledAt !== undefined) updateData.scheduledAt = new Date(data.scheduledAt);
  if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
  if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await prisma.interview.update({ where: { id }, data: updateData });
  return findInterviewById(id);
}
