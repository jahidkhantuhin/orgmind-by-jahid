import type { RequestHandler } from 'express';
import { DocumentSummarySchema, OrganizationDocumentsResponseSchema } from '@orgmind/shared';
import { extensionForFilename } from './document-storage.js';
import { documentsService } from './documents.service.js';

function routeParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export const listDocumentsController: RequestHandler = async (req, res) => {
  const organizationId = routeParam(req.params.organizationId);
  if (!organizationId) {
    res
      .status(400)
      .json({ error: { code: 'INVALID_ORGANIZATION', message: 'Organization is required.' } });
    return;
  }
  res.json(
    OrganizationDocumentsResponseSchema.parse({
      documents: await documentsService.list(organizationId),
    }),
  );
};

export const getDocumentDetailController: RequestHandler = async (req, res) => {
  const organizationId = routeParam(req.params.organizationId);
  const documentId = routeParam(req.params.documentId);
  if (!organizationId || !documentId) {
    res.status(400).json({ error: { code: 'INVALID_DOCUMENT', message: 'Document is required.' } });
    return;
  }
  const detail = await documentsService.getDetail(organizationId, documentId);
  if (!detail) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found.' } });
    return;
  }
  res.json(detail);
};

export const uploadDocumentController: RequestHandler = async (req, res) => {
  const organizationId = routeParam(req.params.organizationId);
  const userId = req.authSession?.user.id;
  const file = req.file;
  if (!organizationId || !userId) {
    res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' } });
    return;
  }
  if (!file) {
    res
      .status(400)
      .json({ error: { code: 'FILE_REQUIRED', message: 'Choose one document to upload.' } });
    return;
  }
  const extension = extensionForFilename(file.originalname);
  if (!extension) {
    res
      .status(415)
      .json({ error: { code: 'UNSUPPORTED_FILE_TYPE', message: 'Unsupported file type.' } });
    return;
  }
  const document = DocumentSummarySchema.parse(
    await documentsService.upload(organizationId, userId, file, extension),
  );
  res.status(202).json({ document });
};

export const deleteDocumentController: RequestHandler = async (req, res) => {
  const organizationId = routeParam(req.params.organizationId);
  const documentId = routeParam(req.params.documentId);
  if (!organizationId || !documentId) {
    res.status(400).json({ error: { code: 'INVALID_DOCUMENT', message: 'Document is required.' } });
    return;
  }
  const deleted = await documentsService.delete(organizationId, documentId);
  if (!deleted) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found.' } });
    return;
  }
  res.status(204).end();
};

export const reingestDocumentController: RequestHandler = async (req, res) => {
  const organizationId = routeParam(req.params.organizationId);
  const documentId = routeParam(req.params.documentId);
  if (!organizationId || !documentId) {
    res.status(400).json({ error: { code: 'INVALID_DOCUMENT', message: 'Document is required.' } });
    return;
  }
  const document = await documentsService.reingest(organizationId, documentId);
  if (!document) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found.' } });
    return;
  }
  res.status(202).json({ document });
};
