import { Router } from 'express';
import { requireOrganizationRole, requireAuth } from '../../auth/auth.middleware.js';
import { listMembersController } from './organizations.controller.js';
import { uploadDocumentFile } from '../documents/document-storage.js';
import {
  deleteDocumentController,
  listDocumentsController,
  uploadDocumentController,
} from '../documents/documents.controller.js';

export const organizationsRouter = Router();

organizationsRouter.get(
  '/:organizationId/members',
  requireAuth,
  requireOrganizationRole(['admin']),
  listMembersController,
);

organizationsRouter.get(
  '/:organizationId/documents',
  requireAuth,
  requireOrganizationRole(['admin', 'member', 'viewer']),
  listDocumentsController,
);
organizationsRouter.post(
  '/:organizationId/documents',
  requireAuth,
  requireOrganizationRole(['admin', 'member']),
  uploadDocumentFile,
  uploadDocumentController,
);
organizationsRouter.delete(
  '/:organizationId/documents/:documentId',
  requireAuth,
  requireOrganizationRole(['admin', 'member']),
  deleteDocumentController,
);
