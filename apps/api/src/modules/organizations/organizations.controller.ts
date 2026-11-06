import type { RequestHandler } from 'express';
import { listOrganizationMembers } from './organizations.service.js';

export const listMembersController: RequestHandler = async (req, res) => {
  const organizationId = req.params.organizationId;
  res.json({ members: await listOrganizationMembers(organizationId) });
};
