import { randomUUID } from 'node:crypto';
import {
  DocumentRecordSchema,
  DocumentSummarySchema,
  type DocumentExtension,
  type DocumentRecord,
  type DocumentSummary,
} from '@orgmind/shared';
import type { Express } from 'express';
import { logger } from '../../lib/logger.js';
import { documentIngestionQueue } from './document-ingestion.queue.js';
import { documentsRepository } from './documents.repository.js';
import { localDocumentStorage, mimeTypeForExtension } from './document-storage.js';

function toSummary(document: DocumentRecord): DocumentSummary {
  return DocumentSummarySchema.parse({
    id: document._id,
    organizationId: document.organizationId,
    ownerId: document.ownerId,
    originalName: document.originalName,
    extension: document.extension,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    status: document.status,
    failureReason: document.failureReason,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    parsedAt: document.parsedAt?.toISOString(),
  });
}

export const documentsService = {
  async list(organizationId: string): Promise<DocumentSummary[]> {
    return (await documentsRepository.listByOrganization(organizationId)).map(toSummary);
  },

  async upload(
    organizationId: string,
    ownerId: string,
    file: Express.Multer.File,
    extension: DocumentExtension,
  ): Promise<DocumentSummary> {
    const now = new Date();
    const document = DocumentRecordSchema.parse({
      _id: randomUUID(),
      organizationId,
      ownerId,
      originalName: file.originalname.replace(/[\\/]/g, '_').slice(0, 255),
      extension,
      mimeType: mimeTypeForExtension(extension),
      sizeBytes: file.size,
      storageKey: file.filename,
      status: 'uploaded',
      createdAt: now,
      updatedAt: now,
    });

    try {
      await documentsRepository.create(document);
      await documentIngestionQueue.add(
        'ingest-document',
        { documentId: document._id },
        { jobId: document._id },
      );
    } catch (error) {
      await documentsRepository
        .deleteByIdInOrganization(document._id, organizationId)
        .catch(() => null);
      await localDocumentStorage.delete(document.storageKey).catch((cleanupError: unknown) => {
        logger.warn(
          { err: cleanupError, storageKey: document.storageKey },
          'Failed to clean up rejected upload',
        );
      });
      throw error;
    }

    return toSummary(document);
  },

  async delete(organizationId: string, documentId: string): Promise<boolean> {
    const document = await documentsRepository.deleteByIdInOrganization(documentId, organizationId);
    if (!document) return false;

    try {
      const job = await documentIngestionQueue.getJob(document._id);
      if (job && (await job.getState()) !== 'active') await job.remove();
    } catch (error) {
      logger.warn(
        { err: error, documentId },
        'Could not remove queued document job during deletion',
      );
    }
    try {
      await localDocumentStorage.delete(document.storageKey);
    } catch (error) {
      logger.error({ err: error, documentId }, 'Could not remove local document file');
    }
    return true;
  },
};
