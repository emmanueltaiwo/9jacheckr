import type { AuthContext, AuthUser, BotTelegramFromHeaders } from './types.js';

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
      authUser?: AuthUser;
      botTelegram?: BotTelegramFromHeaders;
      apiKeyId?: string;
    }
  }
}

export {};
