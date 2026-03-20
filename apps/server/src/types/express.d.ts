import type { AuthContext, AuthUser } from './authTypes.js';

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
      authUser?: AuthUser;
    }
  }
}

export {};
