import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '../../components/auth-form';
import { getCurrentUser } from '../../lib/current-user';
import { ThemeToggle } from '../../components/theme-toggle';

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect('/');
  return (
    <main className="auth-page">
      <ThemeToggle className="knowledge-theme-toggle auth-theme-toggle" />
      <section className="auth-card">
        <Link className="brand" href="/">
          <span className="brand-mark">O</span>
          <span>
            orgmind<span className="brand-dot">.</span>
          </span>
        </Link>
        <p className="eyebrow">A CLEARER WAY TO WORK</p>
        <h1>Create your workspace</h1>
        <p className="auth-description">Start with your team and the knowledge you share.</p>
        <AuthForm mode="register" />
        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
