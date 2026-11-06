'use client';

import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <button className="sign-out-button" onClick={signOut} aria-label="Sign out" title="Sign out">
      ↗
    </button>
  );
}
