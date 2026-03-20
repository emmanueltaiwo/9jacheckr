import type { AuthContext, AuthUser } from './authTypes.js';

export type BotTelegramFromHeaders = {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
      authUser?: AuthUser;
      /** Set when the bot calls verify with x-telegram-user-id (internal token only). */
      botTelegram?: BotTelegramFromHeaders;
    }
  }
}

export {};
