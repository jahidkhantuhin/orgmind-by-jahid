import { isAPIError } from 'better-auth/api';
import { fromNodeHeaders } from 'better-auth/node';
import type { RequestHandler } from 'express';
import { AuthMeResponseSchema, UserSummarySchema } from '@orgmind/shared';
import { auth } from '../../auth/auth.js';
import { listMembershipsForUser } from '../organizations/organizations.service.js';

function forwardCookies(res: Parameters<RequestHandler>[1], headers: Headers): void {
  const cookies = headers.getSetCookie();
  if (cookies.length > 0) res.setHeader('set-cookie', cookies);
}

function sendAuthError(error: unknown, res: Parameters<RequestHandler>[1]): boolean {
  if (!isAPIError(error)) return false;
  res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
  return true;
}

export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const { headers, response } = await auth.api.signUpEmail({
      body: req.body,
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    });
    forwardCookies(res, headers);
    const user = UserSummarySchema.parse(response.user);
    res.status(201).json({ user });
  } catch (error) {
    if (!sendAuthError(error, res)) next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const { headers, response } = await auth.api.signInEmail({
      body: req.body,
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    });
    forwardCookies(res, headers);
    const user = UserSummarySchema.parse(response.user);
    res.status(200).json({ user });
  } catch (error) {
    if (!sendAuthError(error, res)) next(error);
  }
};

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const { headers } = await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    });
    forwardCookies(res, headers);
    res.status(200).json({ success: true });
  } catch (error) {
    if (!sendAuthError(error, res)) next(error);
  }
};

export const currentUserController: RequestHandler = async (req, res, next) => {
  try {
    const user = req.authSession?.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' } });
      return;
    }
    const response = AuthMeResponseSchema.parse({
      user,
      organizations: await listMembershipsForUser(user.id),
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
