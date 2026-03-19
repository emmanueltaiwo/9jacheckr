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
