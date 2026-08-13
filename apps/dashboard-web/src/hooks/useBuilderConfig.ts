import { useState, useCallback, useEffect } from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import {
  getBuilderConfig,
  updateBuilderConfig,
  publishBuilderConfig,
} from '@/lib/api/builder';

interface UseBuilderConfigOptions {
  shopId: string;
  autoLoad?: boolean;
}

interface UseBuilderConfigReturn {
  config: UnifiedBuilderConfig | null;
  loading: boolean;
  error: string | null;
  updateConfig: (config: Partial<UnifiedBuilderConfig>) => Promise<void>;
  publishConfig: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useBuilderConfig({
  shopId,
  autoLoad = true,
}: UseBuilderConfigOptions): UseBuilderConfigReturn {
  const [config, setConfig] = useState<UnifiedBuilderConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!shopId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getBuilderConfig(shopId);
      setConfig(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load config';
      setError(message);
      console.error('Failed to load builder config:', err);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const handleUpdateConfig = useCallback(async (newConfig: Partial<UnifiedBuilderConfig>) => {
    if (!shopId) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await updateBuilderConfig(shopId, newConfig);
      setConfig(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update config';
      setError(message);
      console.error('Failed to update builder config:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const handlePublishConfig = useCallback(async () => {
    if (!shopId) return;

    setLoading(true);
    setError(null);

    try {
      await publishBuilderConfig(shopId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish config';
      setError(message);
      console.error('Failed to publish builder config:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  // Auto-load config on mount
  useEffect(() => {
    if (autoLoad && shopId) {
      fetchConfig();
    }
  }, [autoLoad, shopId, fetchConfig]);

  return {
    config,
    loading,
    error,
    updateConfig: handleUpdateConfig,
    publishConfig: handlePublishConfig,
    refetch: fetchConfig,
  };
}