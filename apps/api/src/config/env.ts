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
});

export const env = EnvSchema.parse(process.env);
