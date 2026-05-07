'use client';

import { useMemo } from 'react';
import { useLocale } from './LocaleProvider';

function getByPath(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function useT() {
  const { dict } = useLocale();
  return useMemo(() => {
    return (key: string, fallback?: string) => getByPath(dict, key) ?? fallback ?? key;
  }, [dict]);
}
