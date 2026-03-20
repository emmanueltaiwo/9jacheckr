import type { NextFunction, Request, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { getAuth } from '../auth/auth.js';

export async function requireAuthSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({
        ok: false,
        code: 'UNAUTHORIZED',
        message: 'Sign in required',
      });
      return;
    }

    const u = session.user;
    req.authUser = {
      id: u.id,
      email: u.email,
      name: u.name ?? undefined,
      image: u.image ?? undefined,
    };
    next();
  } catch (err) {
    next(err);
  }
}
