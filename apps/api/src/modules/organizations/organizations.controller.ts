import type { RequestHandler } from 'express';
import { listOrganizationMembers } from './organizations.service.js';

export const listMembersController: RequestHandler = async (req, res) => {
  const routeOrganizationId = req.params.organizationId;
  const organizationId = Array.isArray(routeOrganizationId)
    ? routeOrganizationId[0]
    : routeOrganizationId;
  if (!organizationId) {
    res
      .status(400)
      .json({ error: { code: 'INVALID_ORGANIZATION', message: 'Organization is required.' } });
    return;
  }
  res.json({ members: await listOrganizationMembers(organizationId) });
};
