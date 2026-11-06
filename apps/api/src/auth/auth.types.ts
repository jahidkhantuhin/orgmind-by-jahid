import type { auth } from './auth.js';

export type AuthSessionContext = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
