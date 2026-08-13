'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/auth';

type Shop = {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  phone?: string;
  email?: string;
  governorate?: string;
  city?: string;
  address?: string;
  openingHours?: string;
};

export function useShop() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/shops/me');
      if (data?.id) {
        setShop(data);
      } else {
        setShop(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch shop data');
      setShop(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  return { shop, loading, error, refetch: fetchShop };
}

export type { Shop };
