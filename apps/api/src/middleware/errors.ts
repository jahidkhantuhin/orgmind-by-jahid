import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { logger } from '../lib/logger.js';
import { UploadInputError } from '../modules/documents/document-storage.js';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof UploadInputError) {
    res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    return;
  }
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE';
    const status = tooLarge ? 413 : 400;
    const code = tooLarge ? 'FILE_TOO_LARGE' : 'INVALID_UPLOAD';
    const message = tooLarge ? 'The document exceeds the configured upload limit.' : error.message;
    res.status(status).json({ error: { code, message } });
    return;
  }
  logger.error({ err: error, requestId: req.id }, 'Unhandled request error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId: req.id,
    },
  });
};
