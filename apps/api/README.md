# OrgMind API

Express 5 API for authentication, sessions, tenant membership, document upload and ingestion, and health reporting. Better Auth uses the MongoDB adapter; organizations, memberships, and document records use repositories validated by shared Zod schemas.

## Local commands

From the repository root, start MongoDB Atlas Local and Redis with `docker compose up -d --wait`, then run `pnpm db:migrate`, `pnpm db:seed`, and `pnpm dev`.

Authentication routes are available at `/auth/register`, `/auth/login`, `/auth/logout`, and `/auth/me`. Better Auth's handler is mounted at `/api/auth/*`. Admin-only organization member listing is available at `/organizations/:organizationId/members`.

Documents can be listed at `GET /organizations/:organizationId/documents`, uploaded as a multipart `file` at `POST /organizations/:organizationId/documents`, and deleted at `DELETE /organizations/:organizationId/documents/:documentId`. Admins and members can upload/delete; organization viewers can list. Redis runs a BullMQ worker for PDF, DOCX, Markdown, and TXT extraction. Configure `UPLOAD_STORAGE_DIR` (default `./.data/uploads`), `MAX_DOCUMENT_UPLOAD_BYTES` (default 10 MiB), and `MAX_DOCUMENT_TEXT_BYTES` (default 3 MiB) in the root `.env`.

## Maintainer

Jahid Khan Tuhin, Full Stack JavaScript Engineer
