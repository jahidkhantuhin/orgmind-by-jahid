import { randomUUID } from 'node:crypto';
import { type Collection, type Document } from 'mongodb';
import { OrganizationDocumentSchema, type OrganizationDocument } from '@orgmind/shared';
import { getDatabase } from '../../lib/connections.js';

function organizations(): Collection<Document> {
  return getDatabase().collection('organizations');
}

function parseDocument(value: unknown): OrganizationDocument {
  return OrganizationDocumentSchema.parse(value);
}

function createSlug(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${base || 'workspace'}-${randomUUID().slice(0, 8)}`;
}

export const organizationsRepository = {
  async ensureIndexes(): Promise<void> {
    await Promise.all([
      organizations().createIndex({ slug: 1 }, { unique: true, name: 'organizations_slug_unique' }),
      organizations().createIndex(
        { ownerId: 1 },
        { unique: true, name: 'organizations_owner_unique' },
      ),
    ]);
  },

  async createForOwner(name: string, ownerId: string): Promise<OrganizationDocument> {
    const existing = await organizations().findOne({ ownerId });
    if (existing) return parseDocument(existing);

    const now = new Date();
    const document = parseDocument({
      _id: randomUUID(),
      name,
      slug: createSlug(name),
      ownerId,
      createdAt: now,
      updatedAt: now,
    });
    try {
      await organizations().insertOne(document);
      return document;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        const createdByConcurrentRequest = await organizations().findOne({ ownerId });
        if (createdByConcurrentRequest) return parseDocument(createdByConcurrentRequest);
      }
      throw error;
    }
  },

  async findByIds(ids: string[]): Promise<OrganizationDocument[]> {
    if (ids.length === 0) return [];
    const rows = await organizations()
      .find({ _id: { $in: ids } })
      .toArray();
    return rows.map(parseDocument);
  },
};
