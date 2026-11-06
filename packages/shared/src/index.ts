import { z } from 'zod';

export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  services: z.object({
    api: z.literal('ok'),
    mongodb: z.enum(['connected', 'disconnected']),
    redis: z.enum(['connected', 'disconnected']),
  }),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
