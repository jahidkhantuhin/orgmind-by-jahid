import type { AuthSessionContext } from '../auth/auth.types.js';
import type { MembershipDocument } from '@orgmind/shared';

declare global {
  namespace Express {
    interface Request {
      id: string;
      authSession?: AuthSessionContext;
      membership?: MembershipDocument;
    }
  }
}

export {};
