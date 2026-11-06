import type { RequestHandler } from 'express';
import { getHealth } from './health.service.js';

export const healthController: RequestHandler = async (_req, res) => {
  const result = await getHealth();
  res.status(result.status).json(result.body);
};
