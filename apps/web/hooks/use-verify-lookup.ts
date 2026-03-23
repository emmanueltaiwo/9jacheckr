'use client';

import { useState } from 'react';
import type {
  ErrorJson,
  ProductJson,
  SuccessJson,
} from '@/components/verify-product-result';

export function useVerifyLookup() {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductJson | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function lookup(trimmed: string) {
    if (!trimmed) {
      setErrorMessage('Enter the number from the product label.');
      setProduct(null);
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setProduct(null);

    try {
      const res = await fetch('/api/verify-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nafdac: trimmed }),
      });
      const data = (await res.json()) as SuccessJson | ErrorJson;

      if (!res.ok || !data.ok) {
        const msg =
          data.ok === false && data.message
            ? data.message
            : 'Something went wrong. Try again shortly.';
        setErrorMessage(msg);
        return;
      }

      setProduct(data.product);
    } catch {
      setErrorMessage(
        'We could not reach the server. Check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setProduct(null);
    setErrorMessage(null);
  }

  return { loading, product, errorMessage, lookup, reset, setErrorMessage };
}
