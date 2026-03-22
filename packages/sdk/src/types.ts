export type Product = {
  nafdac: string;
  name: string;
  category: string;
  source: string;
  manufacturer: string;
  approvedDate: string | null;
  expiryDate: string | null;
  ingredients: string[];
};

export type VerifySuccess = {
  ok: true;
  product: Product;
};

export type VerifyError = {
  ok: false;
  code: string;
  message: string;
  nafdac?: string;
};

export type VerifyResult = VerifySuccess | VerifyError;

/** One row from `POST /api/verify/batch` (API Pro). */
export type BatchItemSuccess = {
  nafdac: string;
  ok: true;
  product: Product;
};

export type BatchItemFailure = {
  nafdac: string;
  ok: false;
  code: string;
  message: string;
};

export type BatchItemResult = BatchItemSuccess | BatchItemFailure;

export type BatchVerifySuccess = {
  ok: true;
  results: BatchItemResult[];
};

/** Full batch response: HTTP-level errors, or per-item results when `ok: true`. */
export type BatchVerifyResult = BatchVerifySuccess | VerifyError;

/** One hit from `GET /api/products/search` (API Pro). */
export type SearchHit = {
  nafdac: string;
  name: string;
  category: string;
  manufacturer: string;
};

export type SearchSuccess = {
  ok: true;
  results: SearchHit[];
};

export type SearchResult = SearchSuccess | VerifyError;
