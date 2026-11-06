import { AppShell } from '../components/app-shell';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../lib/current-user';

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');
  return <AppShell currentUser={currentUser} />;
}
