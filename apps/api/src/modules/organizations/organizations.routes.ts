import { Router } from 'express';
import { requireOrganizationRole, requireAuth } from '../../auth/auth.middleware.js';
import { listMembersController } from './organizations.controller.js';

export const organizationsRouter = Router();

organizationsRouter.get(
  '/:organizationId/members',
  requireAuth,
  requireOrganizationRole(['admin']),
  listMembersController,
);
