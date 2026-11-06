import { type Collection, type Document } from 'mongodb';
import { DocumentRecordSchema, type DocumentRecord, type DocumentStatus } from '@orgmind/shared';
import { getDatabase } from '../../lib/connections.js';

type DocumentRow = DocumentRecord & Document;

function documents(): Collection<DocumentRow> {
  return getDatabase().collection<DocumentRow>('documents');
}

function parseDocument(value: unknown): DocumentRecord {
  return DocumentRecordSchema.parse(value);
}

export const documentsRepository = {
  async ensureIndexes(): Promise<void> {
    await Promise.all([
      documents().createIndex(
        { organizationId: 1, createdAt: -1 },
        { name: 'documents_organization_created' },
      ),
      documents().createIndex({ ownerId: 1 }, { name: 'documents_owner' }),
      documents().createIndex(
        { storageKey: 1 },
        { unique: true, name: 'documents_storage_key_unique' },
      ),
    ]);
  },

  async create(record: DocumentRecord): Promise<DocumentRecord> {
    await documents().insertOne(record);
    return record;
  },

  async findById(id: string): Promise<DocumentRecord | null> {
    const row = await documents().findOne({ _id: id });
    return row ? parseDocument(row) : null;
  },

  async findByIdInOrganization(id: string, organizationId: string): Promise<DocumentRecord | null> {
    const row = await documents().findOne({ _id: id, organizationId });
    return row ? parseDocument(row) : null;
  },

  async listByOrganization(organizationId: string): Promise<DocumentRecord[]> {
    const rows = await documents().find({ organizationId }).sort({ createdAt: -1 }).toArray();
    return rows.map(parseDocument);
  },

  async setStatus(id: string, status: DocumentStatus): Promise<void> {
    await documents().updateOne({ _id: id }, { $set: { status, updatedAt: new Date() } });
  },

  async markParsing(id: string): Promise<void> {
    await documents().updateOne(
      { _id: id },
      { $set: { status: 'parsing', updatedAt: new Date() }, $unset: { failureReason: '' } },
    );
  },

  async markParsed(id: string, extractedText: string): Promise<void> {
    const now = new Date();
    await documents().updateOne(
      { _id: id },
      {
        $set: { status: 'parsed', extractedText, parsedAt: now, updatedAt: now },
        $unset: { failureReason: '' },
      },
    );
  },

  async markFailed(id: string, failureReason: string): Promise<void> {
    await documents().updateOne(
      { _id: id },
      {
        $set: {
          status: 'failed',
          failureReason: failureReason.slice(0, 500),
          updatedAt: new Date(),
        },
      },
    );
  },

  async deleteByIdInOrganization(
    id: string,
    organizationId: string,
  ): Promise<DocumentRecord | null> {
    const row = await documents().findOneAndDelete({ _id: id, organizationId });
    return row ? parseDocument(row) : null;
  },
};
