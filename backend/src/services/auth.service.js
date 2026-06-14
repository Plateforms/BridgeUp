import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';

const RESERVED_NAMES = ['admin', 'internal-tool', 'api', 'system'];

export async function registerUser({ email, password, role, name, companyName }) {
  const normalized = email.toLowerCase().trim();
  const localPart = normalized.split('@')[0];
  if (RESERVED_NAMES.includes(localPart)) {
    throw Object.assign(new Error('Email not allowed'), { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      role,
      name,
      companyName: role === 'company' ? companyName || null : null,
    },
  });

  logger.info('User registered', { userId: user.id, role, email: normalized });
  return { id: user.id, email: normalized, role, name };
}

export async function loginUser({ email, password }) {
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getEnv().JWT_SECRET,
    { expiresIn: getEnv().JWT_EXPIRES_IN },
  );

  logger.info('User logged in', { userId: user.id, role: user.role });
  return {
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  };
}

export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, name: true, companyName: true, createdAt: true },
  });
}
