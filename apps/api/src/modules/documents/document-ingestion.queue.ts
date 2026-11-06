import { Queue, Worker, type Job, UnrecoverableError } from 'bullmq';
import type { DocumentRecord } from '@orgmind/shared';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { documentsRepository } from './documents.repository.js';
import { localDocumentStorage } from './document-storage.js';
import { extractDocumentText } from './text-extraction.service.js';

export const DOCUMENT_INGESTION_QUEUE = 'document-ingestion';

export type IngestionJobData = { documentId: string };
export type IngestionJobResult = { documentId: string; characterCount: number };

const redisUrl = new URL(env.REDIS_URL);

function redisConnection(maxRetriesPerRequest?: number | null) {
  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username ? decodeURIComponent(redisUrl.username) : undefined,
    password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
    db: Number(redisUrl.pathname.replace(/^\//, '') || 0),
    maxRetriesPerRequest,
    ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}

export const documentIngestionQueue = new Queue<IngestionJobData, IngestionJobResult>(
  DOCUMENT_INGESTION_QUEUE,
  {
    connection: redisConnection(1),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1_000, jitter: 0.25 },
      removeOnComplete: 500,
      removeOnFail: 1_000,
    },
  },
);

type ProcessorDependencies = {
  findDocument: (_id: string) => Promise<DocumentRecord | null>;
  markParsing: (_id: string) => Promise<void>;
  markParsed: (_id: string, _extractedText: string) => Promise<void>;
  markFailed: (_id: string, _reason: string) => Promise<void>;
  readFile: (_key: string) => Promise<Buffer>;
  extractText: typeof extractDocumentText;
};

const defaultDependencies: ProcessorDependencies = {
  findDocument: (id) => documentsRepository.findById(id),
  markParsing: (id) => documentsRepository.markParsing(id),
  markParsed: (id, text) => documentsRepository.markParsed(id, text),
  markFailed: (id, reason) => documentsRepository.markFailed(id, reason),
  readFile: (key) => localDocumentStorage.read(key),
  extractText: extractDocumentText,
};

export function createDocumentIngestionProcessor(
  dependencies: ProcessorDependencies = defaultDependencies,
) {
  return async (job: Job<IngestionJobData, IngestionJobResult>): Promise<IngestionJobResult> => {
    const document = await dependencies.findDocument(job.data.documentId);
    if (!document) throw new UnrecoverableError('Document no longer exists.');
    if (document.status === 'parsed') {
      return { documentId: document._id, characterCount: document.extractedText?.length ?? 0 };
    }

    await dependencies.markParsing(document._id);
    try {
      const file = await dependencies.readFile(document.storageKey);
      const extractedText = await dependencies.extractText(document.extension, file);
      await dependencies.markParsed(document._id, extractedText);
      return { documentId: document._id, characterCount: extractedText.length };
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error('Document processing failed.');
      const maxAttempts = job.opts.attempts ?? 1;
      if (job.attemptsMade + 1 >= maxAttempts) {
        await dependencies.markFailed(document._id, error.message);
      }
      throw error;
    }
  };
}

export function startDocumentIngestionWorker(): Worker<IngestionJobData, IngestionJobResult> {
  const worker = new Worker<IngestionJobData, IngestionJobResult>(
    DOCUMENT_INGESTION_QUEUE,
    createDocumentIngestionProcessor(),
    { connection: redisConnection(null), concurrency: 2 },
  );
  worker.on('failed', (job, error) => {
    logger.warn({ documentId: job?.data.documentId, err: error }, 'Document ingestion job failed');
  });
  worker.on('error', (error) => {
    logger.error({ err: error }, 'Document ingestion worker error');
  });
  return worker;
}

export async function closeDocumentIngestionQueue(): Promise<void> {
  await documentIngestionQueue.close();
}
