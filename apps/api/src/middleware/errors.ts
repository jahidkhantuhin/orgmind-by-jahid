import type { ErrorRequestHandler } from 'express';
import { logger } from '../lib/logger.js';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  logger.error({ err: error, requestId: req.id }, 'Unhandled request error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId: req.id,
    },
  });
};
