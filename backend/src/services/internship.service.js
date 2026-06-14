import prisma from '../lib/prisma.js';
import logger from '../config/logger.js';

export async function createInternship({ companyId, title, description, requirements, location }) {
  const internship = await prisma.internship.create({
    data: { companyId, title, description, requirements, location },
  });
  logger.info('Internship created', { id: internship.id, companyId, title });
  return findInternshipById(internship.id);
}

export async function findInternshipById(id) {
  const row = await prisma.internship.findUnique({
    where: { id },
    include: { company: { select: { name: true, email: true } } },
  });
  if (!row) return null;
  return {
    id: row.id,
    company_id: row.companyId,
    title: row.title,
    description: row.description,
    requirements: row.requirements,
    location: row.location,
    is_active: row.isActive,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    company_name: row.company.name,
    company_email: row.company.email,
  };
}

export async function listInternships({ activeOnly, companyId, q, page = 1, limit = 20 } = {}) {
  const where = {};
  if (activeOnly) where.isActive = true;
  if (companyId) where.companyId = companyId;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.internship.findMany({
      where,
      include: { company: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.internship.count({ where }),
  ]);

  return {
    data: rows.map(row => ({
      id: row.id,
      company_id: row.companyId,
      title: row.title,
      description: row.description,
      requirements: row.requirements,
      location: row.location,
      is_active: row.isActive,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
      company_name: row.company.name,
      company_email: row.company.email,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateInternship(id, data) {
  await prisma.internship.update({ where: { id }, data });
  return findInternshipById(id);
}

export async function deleteInternship(id) {
  await prisma.internship.delete({ where: { id } });
  logger.info('Internship deleted', { id });
}
