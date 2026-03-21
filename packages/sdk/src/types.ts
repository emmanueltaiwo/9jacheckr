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
