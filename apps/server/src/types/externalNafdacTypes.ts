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
