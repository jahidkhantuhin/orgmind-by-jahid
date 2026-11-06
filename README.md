# OrgMind

OrgMind is a company-internal knowledge assistant built around agentic retrieval-augmented generation (RAG). It is designed to help teams find trustworthy answers grounded in the information their organization already owns.

## Step 1: Monorepo foundation

This first foundation includes a pnpm TypeScript workspace, an Express 5 API with dependency health checks, a Next.js dashboard shell, local MongoDB Atlas Local and Redis services, and CI quality checks. The API reports a degraded state until both data services are reachable.

## Quick start

Requirements: Node.js 22.13+, pnpm 11.28+, and Docker Compose.

```sh
docker compose up -d
pnpm install
pnpm dev
```

If you do not already have a local `.env` file, copy `.env.example` to `.env` before starting the services. Keep your local `.env` values when updating the example.

Open [http://localhost:3000](http://localhost:3000). The API status badge should show “API operational” after MongoDB and Redis are healthy. API health is available at [http://localhost:4000/health](http://localhost:4000/health).

## Workspace

- `apps/web` — Next.js App Router interface with Tailwind CSS and a shadcn/ui-ready component setup.
- `apps/api` — Express 5 service with validated environment configuration, logging, security middleware, health checks, and centralized errors.
- `packages/shared` — shared Zod schemas and API contract types.

## Quality checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Author

Jahid Khan Tuhin, Full Stack JavaScript Engineer
