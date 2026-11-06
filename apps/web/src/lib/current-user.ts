import { headers } from 'next/headers';
import { AuthMeResponseSchema, type AuthMeResponse } from '@orgmind/shared';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function getCurrentUser(): Promise<AuthMeResponse | null> {
  const cookie = (await headers()).get('cookie');
  if (!cookie) return null;

  const response = await fetch(`${apiUrl}/auth/me`, {
    headers: { cookie },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return AuthMeResponseSchema.parse(await response.json());
}
