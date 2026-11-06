import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

type RequestPart = 'body' | 'query' | 'params';
export function validate(schemas: Partial<Record<RequestPart, ZodType>>): RequestHandler {
  return (req, res, next) => {
    for (const part of ['body', 'query', 'params'] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: result.error.issues,
          },
        });
        return;
      }
    }
    next();
  };
}
