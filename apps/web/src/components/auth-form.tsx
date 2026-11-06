'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LoginSchema, RegisterSchema } from '@orgmind/shared';

type AuthFormProps = { mode: 'login' | 'register' };
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const isRegister = mode === 'register';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const formData = new FormData(event.currentTarget);
    const values = {
      name: String(formData.get('name') ?? ''),
      organizationName: String(formData.get('organizationName') ?? ''),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    };
    const result = isRegister ? RegisterSchema.safeParse(values) : LoginSchema.safeParse(values);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Check the information and try again.');
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`${apiUrl}/auth/${mode}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(result.data),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload !== null && 'error' in payload
            ? (payload.error as { message?: string }).message
            : undefined;
        throw new Error(message ?? 'Unable to sign in. Please try again.');
      }
      router.replace('/');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {isRegister && (
        <>
          <label>
            Your name
            <input name="name" autoComplete="name" required minLength={2} maxLength={80} />
          </label>
          <label>
            Organization name
            <input
              name="organizationName"
              autoComplete="organization"
              required
              minLength={2}
              maxLength={100}
            />
          </label>
        </>
      )}
      <label>
        Work email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          required
          minLength={isRegister ? 12 : 1}
          maxLength={128}
        />
        {isRegister && <small>Use at least 12 characters.</small>}
      </label>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button className="primary-button auth-submit" type="submit" disabled={pending}>
        {pending ? 'Please wait…' : isRegister ? 'Create workspace' : 'Sign in'}
        {!pending && <span>→</span>}
      </button>
    </form>
  );
}
