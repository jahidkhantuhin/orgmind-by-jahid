import { ObjectId, type Collection, type Document } from 'mongodb';
import { UserDocumentSchema, UserSummarySchema, type UserSummary } from '@orgmind/shared';
import { getDatabase } from '../../lib/connections.js';

function users(): Collection<Document> {
  return getDatabase().collection('users');
}

function parseUser(value: unknown): UserSummary {
  const user = UserDocumentSchema.parse(value);
  const id = user.id ?? String(user._id ?? '');
  return UserSummarySchema.parse({ id, name: user.name, email: user.email });
}

export const usersRepository = {
  async ensureIndexes(): Promise<void> {
    await users().createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });
  },

  async findByEmail(email: string): Promise<UserSummary | null> {
    const row = await users().findOne({ email: email.toLowerCase() });
    return row ? parseUser(row) : null;
  },

  async findByIds(ids: string[]): Promise<UserSummary[]> {
    if (ids.length === 0) return [];
    const objectIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    const rows = await users()
      .find({ $or: [{ _id: { $in: [...objectIds, ...ids] } }, { id: { $in: ids } }] })
      .toArray();
    return rows.map(parseUser);
  },
};
