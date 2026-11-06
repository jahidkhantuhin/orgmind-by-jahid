import type { Job } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';
import type { DocumentRecord } from '@orgmind/shared';
import {
  createDocumentIngestionProcessor,
  type IngestionJobData,
  type IngestionJobResult,
} from '../src/modules/documents/document-ingestion.queue.js';

const document: DocumentRecord = {
  _id: 'edac42f2-c30e-4ea8-9428-4757e3562212',
  organizationId: 'org-1',
  ownerId: 'user-1',
  originalName: 'handbook.txt',
  extension: 'txt',
  mimeType: 'text/plain',
  sizeBytes: 18,
  storageKey: 'edac42f2-c30e-4ea8-9428-4757e3562212.txt',
  status: 'uploaded',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function job(attemptsMade = 0, attempts = 3): Job<IngestionJobData, IngestionJobResult> {
  return {
    data: { documentId: document._id },
    attemptsMade,
    opts: { attempts },
  } as Job<IngestionJobData, IngestionJobResult>;
}

describe('document ingestion processor', () => {
  it('moves an uploaded document through parsing to parsed', async () => {
    const calls: string[] = [];
    const processor = createDocumentIngestionProcessor({
      findDocument: vi.fn().mockResolvedValue(document),
      markParsing: vi.fn(async () => void calls.push('parsing')),
      markParsed: vi.fn(async (_id, text) => void calls.push(`parsed:${text}`)),
      markFailed: vi.fn(async (_id, reason) => void calls.push(`failed:${reason}`)),
      readFile: vi.fn().mockResolvedValue(Buffer.from('Handbook text')),
      extractText: vi.fn().mockResolvedValue('Handbook text'),
    });

    await expect(processor(job())).resolves.toEqual({
      documentId: document._id,
      characterCount: 'Handbook text'.length,
    });
    expect(calls).toEqual(['parsing', 'parsed:Handbook text']);
  });

  it('marks a document failed after the final retry', async () => {
    const markFailed = vi.fn().mockResolvedValue(undefined);
    const processor = createDocumentIngestionProcessor({
      findDocument: vi.fn().mockResolvedValue(document),
      markParsing: vi.fn().mockResolvedValue(undefined),
      markParsed: vi.fn().mockResolvedValue(undefined),
      markFailed,
      readFile: vi.fn().mockRejectedValue(new Error('disk unavailable')),
      extractText: vi.fn(),
    });

    await expect(processor(job(2, 3))).rejects.toThrow('disk unavailable');
    expect(markFailed).toHaveBeenCalledWith(document._id, 'disk unavailable');
  });

  it('leaves transient failures retryable before the last attempt', async () => {
    const markFailed = vi.fn().mockResolvedValue(undefined);
    const processor = createDocumentIngestionProcessor({
      findDocument: vi.fn().mockResolvedValue(document),
      markParsing: vi.fn().mockResolvedValue(undefined),
      markParsed: vi.fn().mockResolvedValue(undefined),
      markFailed,
      readFile: vi.fn().mockRejectedValue(new Error('temporary disk error')),
      extractText: vi.fn(),
    });

    await expect(processor(job(0, 3))).rejects.toThrow('temporary disk error');
    expect(markFailed).not.toHaveBeenCalled();
  });
});
