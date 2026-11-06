# OrgMind

OrgMind is a company-internal knowledge assistant built around agentic retrieval-augmented generation (RAG). It is designed to help teams find trustworthy answers grounded in the information their organization already owns.

## Step 1: Monorepo foundation

This first foundation includes a pnpm TypeScript workspace, an Express 5 API with dependency health checks, a Next.js dashboard shell, local MongoDB Atlas Local and Redis services, and CI quality checks. The API reports a degraded state until both data services are reachable.

## Step 2: Database, authentication, and RBAC

Added Better Auth email/password sessions backed by MongoDB, validated organizations and memberships, versioned index bootstrap, and an idempotent admin seed. The first registration creates an organization and an admin membership. Admin-only member listing is protected by API role checks and the Next.js server page.

## Quick start

Requirements: Node.js 22.13+, pnpm 11.28+, and Docker Compose.

```sh
docker compose up -d --wait
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

If you do not already have a local `.env` file, copy `.env.example` to `.env` before starting the services. Keep your local `.env` values when updating the example.

Open [http://localhost:3000](http://localhost:3000). The API status badge should show “API operational” after MongoDB and Redis are healthy. API health is available at [http://localhost:4000/health](http://localhost:4000/health).

## Workspace

- `apps/web` — Next.js App Router interface with Tailwind CSS and a shadcn/ui-ready component setup.
- `apps/api` — Express 5 service with validated environment configuration, logging, security middleware, health checks, and centralized errors.
- `packages/shared` — shared Zod schemas and API contract types.

The seeded local account uses `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from `.env`. Change the sample password before sharing a development environment.

## Quality checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The authentication integration test uses the separate `TEST_MONGODB_DATABASE` database. Run it with Docker services available.

## Author

Jahid Khan Tuhin, Full Stack JavaScript Engineer
