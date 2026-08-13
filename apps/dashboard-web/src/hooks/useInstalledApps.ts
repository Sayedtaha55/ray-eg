'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/auth';

type InstalledApp = {
  id: string;
  shopId: string;
  appId: string;
  status: 'INSTALLED' | 'UNINSTALLED';
  isActive: boolean;
  installedAt: string;
  app: {
    id: string;
    key: string;
    name: string;
    description?: string;
    version?: string;
  };
};

export function useInstalledApps() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/apps/me');
      const list = Array.isArray(data) ? data : (data?.apps || data?.data || []);
      setApps(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch installed apps');
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const isInstalled = useCallback((appKey: string): boolean => {
    return apps.some(
      a => a.app?.key === appKey && a.status === 'INSTALLED' && a.isActive
    );
  }, [apps]);

  const getApp = useCallback((appKey: string): InstalledApp | null => {
    return apps.find(
      a => a.app?.key === appKey && a.status === 'INSTALLED'
    ) || null;
  }, [apps]);

  return {
    apps,
    loading,
    error,
    isInstalled,
    getApp,
    refetch: fetchApps,
  };
}
