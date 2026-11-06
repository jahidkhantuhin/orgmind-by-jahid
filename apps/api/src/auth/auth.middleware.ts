import { fromNodeHeaders } from 'better-auth/node';
import type { RequestHandler } from 'express';
import { auth } from './auth.js';
import { membershipsRepository } from '../modules/organizations/memberships.repository.js';
import type { MembershipRole } from '@orgmind/shared';

export const requireAuth: RequestHandler = async (req, res, next) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' } });
    return;
  }
  req.authSession = session;
  next();
};

export function requireOrganizationRole(allowedRoles: MembershipRole[]): RequestHandler {
  return async (req, res, next) => {
    const userId = req.authSession?.user.id;
    const organizationId = req.params.organizationId;
    if (!userId) {
      res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' } });
      return;
    }
    if (!organizationId) {
      res
        .status(400)
        .json({ error: { code: 'INVALID_ORGANIZATION', message: 'Organization is required.' } });
      return;
    }

    const membership = await membershipsRepository.findForUserInOrganization(
      userId,
      organizationId,
    );
    if (!membership || !allowedRoles.includes(membership.role)) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You do not have access to this organization.' },
      });
      return;
    }
    req.membership = membership;
    next();
  };
}
