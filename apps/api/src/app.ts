import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Request } from 'express';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { healthRouter } from './modules/health/health.routes.js';
import { errorHandler } from './middleware/errors.js';

export const app = express();
app.disable('x-powered-by');
app.use((req, _res, next) => {
  req.id = randomUUID();
  next();
});
app.use(pinoHttp({ logger, genReqId: (req) => (req as Request).id }));
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use('/health', healthRouter);
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});
app.use(errorHandler);
