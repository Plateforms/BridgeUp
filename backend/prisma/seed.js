import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@internship.local' },
    update: {},
    create: { email: 'admin@internship.local', passwordHash: hash, role: 'admin', name: 'Admin' },
  });

  const company = await prisma.user.upsert({
    where: { email: 'company@test.local' },
    update: {},
    create: { email: 'company@test.local', passwordHash: hash, role: 'company', name: 'Test Corp', companyName: 'Test Corp' },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@test.local' },
    update: {},
    create: { email: 'student@test.local', passwordHash: hash, role: 'student', name: 'Test Student' },
  });

  const internship = await prisma.internship.upsert({
    where: { id: 1 },
    update: {},
    create: {
      companyId: company.id,
      title: 'Software Engineer Intern',
      description: 'Build cool stuff with our team',
      requirements: 'JavaScript, React',
      location: 'Remote',
    },
  });

  const application = await prisma.application.upsert({
    where: { id: 1 },
    update: {},
    create: {
      internshipId: internship.id,
      studentId: student.id,
      status: 'pending',
      coverLetter: 'I am very interested in this position.',
    },
  });

  console.log('Seed complete:', { admin: admin.email, company: company.email, student: student.email, internship: internship.title, application: application.id });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
