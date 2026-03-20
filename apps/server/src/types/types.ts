export interface AuthContext {
  source: 'api_key' | 'bot';
  userId?: string;
}

/** Better Auth user (session); canonical id for `ApiKey.userId`. */
export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  image?: string;
};

export type BotTelegramFromHeaders = {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

export type VerifyOutcome = 'found' | 'not_found' | 'failed';

export type BotTelegramPayload = {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

export interface BotActivityRequestBody {
  event?: string;
  telegramId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface ExternalNafdacPayload {
  nafdac?: string;
  name?: string;
  category?: string;
  source?: string;
  manufacturer?: string;
  approvedDate?: string | null;
  expiryDate?: string | null;
  ingredients?: string[];
  approved?: boolean;
}

export interface ProductPlain {
  nafdac: string;
  name: string;
  category: string;
  source: string;
  manufacturer: string;
  approvedDate: Date | null;
  expiryDate: Date | null;
  ingredients: string[];
}

export interface VerifyApiSuccess {
  ok: true;
  product: ProductPlain;
}

export interface VerifyApiErrorBody {
  ok: false;
  code: string;
  message: string;
  nafdac?: string;
}
