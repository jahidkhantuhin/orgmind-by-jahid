import { redirect } from 'next/navigation';
import { KnowledgeBase } from '../../components/knowledge-base';
import { getCurrentUser } from '../../lib/current-user';

export default async function KnowledgePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');
  const organization = currentUser.organizations[0];
  if (!organization) redirect('/');

  return (
    <KnowledgeBase
      organizationId={organization.organizationId}
      organizationName={organization.organizationName}
      role={organization.role}
    />
  );
}
