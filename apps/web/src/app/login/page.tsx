import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '../../components/auth-form';
import { getCurrentUser } from '../../lib/current-user';
import { ThemeToggle } from '../../components/theme-toggle';

export default async function LoginPage() {
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
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in to your workspace</h1>
        <p className="auth-description">Your team&apos;s knowledge is ready when you are.</p>
        <AuthForm mode="login" />
        <p className="auth-switch">
          New to OrgMind? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
