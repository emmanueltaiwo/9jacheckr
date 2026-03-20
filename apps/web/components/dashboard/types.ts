export type KeyResponse = {
  ok: boolean;
  key: null | {
    id: string;
    keyPrefix: string;
    maskedKey: string;
    lastUsedAt: string | null;
  };
};

export type CreateKeyResponse = {
  ok: boolean;
  key: {
    id: string;
    rawKey: string;
    keyPrefix: string;
    maskedKey: string;
    lastUsedAt: string | null;
  };
};

export type MetricResponse = {
  ok: boolean;
  month: string;
  metrics: {
    total: number;
    found: number;
    notFound: number;
    failed: number;
  };
};
