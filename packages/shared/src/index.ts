import { z } from 'zod';

export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  services: z.object({
    api: z.literal('ok'),
    mongodb: z.enum(['connected', 'disconnected']),
    redis: z.enum(['connected', 'disconnected']),
  }),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const MembershipRoleSchema = z.enum(['admin', 'member', 'viewer']);
export type MembershipRole = z.infer<typeof MembershipRoleSchema>;

export const OrganizationDocumentSchema = z.object({
  _id: z.string().min(1),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(120),
  ownerId: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type OrganizationDocument = z.infer<typeof OrganizationDocumentSchema>;

export const MembershipDocumentSchema = z.object({
  _id: z.string().min(1),
  organizationId: z.string().min(1),
  userId: z.string().min(1),
  role: MembershipRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type MembershipDocument = z.infer<typeof MembershipDocumentSchema>;

export const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(80),
  organizationName: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(12).max(128),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const UserSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});
export type UserSummary = z.infer<typeof UserSummarySchema>;

export const OrganizationMembershipSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  organizationName: z.string(),
  organizationSlug: z.string(),
  role: MembershipRoleSchema,
});
export type OrganizationMembership = z.infer<typeof OrganizationMembershipSchema>;

export const AuthMeResponseSchema = z.object({
  user: UserSummarySchema,
  organizations: z.array(OrganizationMembershipSchema),
});
export type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;

export const OrganizationMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.email(),
  role: MembershipRoleSchema,
  joinedAt: z.string().datetime(),
});
export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;

export const OrganizationMembersResponseSchema = z.object({
  members: z.array(OrganizationMemberSchema),
});
export type OrganizationMembersResponse = z.infer<typeof OrganizationMembersResponseSchema>;

export const UserDocumentSchema = z.object({
  id: z.string().optional(),
  _id: z.unknown().optional(),
  name: z.string(),
  email: z.email(),
});
export type UserDocument = z.infer<typeof UserDocumentSchema>;

export const MigrationDocumentSchema = z.object({
  _id: z.string(),
  appliedAt: z.date(),
});
export type MigrationDocument = z.infer<typeof MigrationDocumentSchema>;

export const DocumentExtensionSchema = z.enum(['pdf', 'docx', 'md', 'txt']);
export type DocumentExtension = z.infer<typeof DocumentExtensionSchema>;

export const DocumentStatusSchema = z.enum(['uploaded', 'parsing', 'parsed', 'failed']);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

export const DocumentRecordSchema = z.object({
  _id: z.string().uuid(),
  organizationId: z.string().min(1),
  ownerId: z.string().min(1),
  originalName: z.string().min(1).max(255),
  extension: DocumentExtensionSchema,
  mimeType: z.string().min(1).max(128),
  sizeBytes: z.number().int().positive(),
  storageKey: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(pdf|docx|md|txt)$/i,
    ),
  status: DocumentStatusSchema,
  extractedText: z.string().optional(),
  failureReason: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  parsedAt: z.date().optional(),
});
export type DocumentRecord = z.infer<typeof DocumentRecordSchema>;

export const DocumentSummarySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  ownerId: z.string(),
  originalName: z.string(),
  extension: DocumentExtensionSchema,
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
  status: DocumentStatusSchema,
  failureReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  parsedAt: z.string().datetime().optional(),
});
export type DocumentSummary = z.infer<typeof DocumentSummarySchema>;

export const OrganizationDocumentsResponseSchema = z.object({
  documents: z.array(DocumentSummarySchema),
});
export type OrganizationDocumentsResponse = z.infer<typeof OrganizationDocumentsResponseSchema>;
