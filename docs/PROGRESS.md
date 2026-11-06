# Project progress

## Step 1: Monorepo foundation

- Added a strict TypeScript pnpm workspace with shared Zod contracts and common formatting/lint tooling.
- Added an Express 5 API with environment validation, request IDs, pino logging, security middleware, MongoDB/Redis health checks, validation middleware, centralized errors, and graceful shutdown.
- Added a responsive Next.js dashboard shell with dark mode and a live API status badge.
- Added local MongoDB Atlas Local and Redis Compose services, environment example, and GitHub Actions CI.
- Added a Supertest health endpoint test.

## Step 2: Database, authentication, and RBAC

- Added Better Auth 1.7.18 with the official MongoDB adapter, email/password sessions, a trusted frontend origin, and cookie forwarding through Express.
- Added validated `users`, `organizations`, and `memberships` repositories, an idempotent versioned index runner, and an admin seed command.
- New registrations create a private workspace and an `admin` membership. `admin`, `member`, and `viewer` are modeled as shared role values; member listing requires admin access in the API.
- Added login/register forms, protected workspace pages, a sign-out control, and an admin-only Members settings page.
- Added auth flow integration coverage and RBAC unit tests; the auth flow test skips when the test MongoDB is not available.

## Step 3: Document upload and ingestion

- Added organization-scoped document records and indexes, role-checked upload/list/delete API routes, and local disk storage with configurable file and extracted-text size limits.
- Added a Redis-backed BullMQ ingestion worker with retries and status transitions. PDF, DOCX, Markdown, and TXT files are parsed to bounded plain text; extraction failures are visible on each document.
- Added the Knowledge base page with upload, processing status, and delete actions. Viewers can browse status; members and admins can upload and delete.
- Added parser and worker tests with PDF, DOCX, Markdown, and TXT fixtures. Local uploads are ignored by Git.

## Step 4: Chunking, embeddings, and vector storage

- Added a structure-aware chunker with heading paths, intact Markdown table rows, configurable size, and overlap.
- Added an embedding provider interface and Google Gemini implementation with sequential batches, retrieval task types, exponential retries for rate limits/transient failures, vector validation, and normalization.
- Added `chunks` records with tenant, collection, ACL, document, position, and heading metadata. Embeddings are stored as BSON float32 vectors. Chunk replacement and document deletion use MongoDB transactions.
- Extended the worker with chunking and embedding statuses, atomic chunk replacement, and retryable reprocessing. Added document detail and reprocess routes plus a chunk preview page.
- Added version-controlled MongoDB vector and text Search index definitions, filter fields for `orgId`, `collectionId`, `acl`, and `documentId`, and a command that waits for both indexes to become READY.
- Updated local MongoDB to Atlas Local `preview`, which bundles MongoDB Search and Vector Search, and added mocked chunker/provider tests.
