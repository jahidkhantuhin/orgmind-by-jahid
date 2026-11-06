'use client';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function SignOutButton() {
  async function signOut() {
    await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.assign('/login');
  }

  return (
    <button className="sign-out-button" onClick={signOut} aria-label="Sign out" title="Sign out">
      ↗
    </button>
  );
}
