import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Redis from 'ioredis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getEnv } from './config/env.js';

const redisClient = new Redis(getEnv().REDIS_URL);
const limiter = rateLimit({
  store: new RedisStore({ sendCommand: (...args) => redisClient.call(...args) }),
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

import authRoutes from './routes/auth.routes.js';
import internshipRoutes from './routes/internships.routes.js';
import applicationRoutes from './routes/applications.routes.js';
import interviewRoutes from './routes/interviews.routes.js';
import companyRoutes from './routes/companies.routes.js';
import ratingRoutes from './routes/ratings.routes.js';
import uploadRoutes from './routes/uploads.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middleware/error.js';
import logger from './config/logger.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

app.use((req, res, next) => {
  req.logger = logger;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/companies', ratingRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;
