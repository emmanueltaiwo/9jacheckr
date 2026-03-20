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
      res
        .status(401)
        .json({ ok: false, code: 'UNAUTHORIZED', message: 'Sign in required' });
      return;
    }

    req.authUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? null,
    };

    next();
  } catch (err) {
    next(err);
  }
}
