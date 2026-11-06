# OrgMind API

Express 5 API for authentication, sessions, tenant membership, and health reporting. Better Auth uses the MongoDB adapter; organizations and memberships use repositories validated by shared Zod schemas.

## Local commands

From the repository root, start MongoDB Atlas Local and Redis with `docker compose up -d --wait`, then run `pnpm db:migrate`, `pnpm db:seed`, and `pnpm dev`.

Authentication routes are available at `/auth/register`, `/auth/login`, `/auth/logout`, and `/auth/me`. Better Auth's handler is mounted at `/api/auth/*`. Admin-only organization member listing is available at `/organizations/:organizationId/members`.

## Maintainer

Jahid Khan Tuhin, Full Stack JavaScript Engineer
