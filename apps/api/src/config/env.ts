import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  MONGODB_URI: z
    .string()
    .min(1)
    .default(
      'mongodb://root:orgmind-local@localhost:27017/orgmind?authSource=admin&directConnection=true',
    ),
  MONGODB_DATABASE: z.string().min(1).default('orgmind'),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  TEST_MONGODB_DATABASE: z.string().min(1).default('orgmind_test'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:4000'),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32)
    .default('orgmind-local-development-secret-change-before-deploying-2026'),
  SEED_ADMIN_NAME: z.string().min(2).default('OrgMind Admin'),
  SEED_ADMIN_EMAIL: z.email().default('admin@orgmind.local'),
  SEED_ADMIN_PASSWORD: z.string().min(12).default('ChangeThisPassword123!'),
  SEED_ORGANIZATION_NAME: z.string().min(2).default('OrgMind'),
});

const parsedEnv = EnvSchema.parse(process.env);
if (
  parsedEnv.NODE_ENV === 'production' &&
  parsedEnv.BETTER_AUTH_SECRET === 'orgmind-local-development-secret-change-before-deploying-2026'
) {
  throw new Error('BETTER_AUTH_SECRET must be set to a unique secret in production.');
}
if (parsedEnv.NODE_ENV === 'production' && parsedEnv.BETTER_AUTH_URL.includes('localhost')) {
  throw new Error('BETTER_AUTH_URL must use the deployed API origin in production.');
}

export const env = parsedEnv;
