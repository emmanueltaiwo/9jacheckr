export interface ProductDto {
  nafdac: string;
  name: string;
  category: string;
  source: string;
  manufacturer: string;
  approvedDate: string | null;
  expiryDate: string | null;
  ingredients: string[];
}

export interface VerifySuccessDto {
  ok: true;
  product: ProductDto;
}

export interface VerifyErrorDto {
  ok: false;
  code: string;
  message: string;
  nafdac?: string;
  candidates?: string[];
}

export type VerifyResponseDto = VerifySuccessDto | VerifyErrorDto;
