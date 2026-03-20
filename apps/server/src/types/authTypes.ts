export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface AuthContext {
  source: 'api_key' | 'bot';
  /** Better Auth user id when `source` is `api_key` */
  userId?: string;
}
