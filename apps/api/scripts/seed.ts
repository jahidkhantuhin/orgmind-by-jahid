import { auth } from '../src/auth/auth.js';
import { env } from '../src/config/env.js';
import { closeConnections } from '../src/lib/connections.js';
import { logger } from '../src/lib/logger.js';
import { runMigrations } from '../src/db/migrations/runner.js';
import { provisionPersonalOrganization } from '../src/modules/organizations/organizations.service.js';
import { usersRepository } from '../src/modules/users/users.repository.js';

try {
  await runMigrations();
  let user = await usersRepository.findByEmail(env.SEED_ADMIN_EMAIL);
  if (!user) {
    const created = await auth.api.signUpEmail({
      body: {
        name: env.SEED_ADMIN_NAME,
        email: env.SEED_ADMIN_EMAIL,
        password: env.SEED_ADMIN_PASSWORD,
        organizationName: env.SEED_ORGANIZATION_NAME,
      },
    });
    user = {
      id: created.user.id,
      name: created.user.name,
      email: created.user.email,
    };
  }
  await provisionPersonalOrganization(user.id, env.SEED_ORGANIZATION_NAME);
  logger.info({ email: user.email }, 'Seed administrator is ready.');
} catch (error) {
  logger.error({ err: error }, 'Database seed failed.');
  process.exitCode = 1;
} finally {
  await closeConnections();
}
