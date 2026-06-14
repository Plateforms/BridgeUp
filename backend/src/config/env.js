import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/internship'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  S3_BUCKET: z.string().default('internship-cvs'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().default('minioadmin'),
  S3_SECRET_KEY: z.string().default('minioadmin'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('noreply@internship.local'),
});

let _env;
export function getEnv() {
  if (!_env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('Invalid environment variables:', result.error.flatten());
      process.exit(1);
    }
    _env = result.data;
  }
  return _env;
}
