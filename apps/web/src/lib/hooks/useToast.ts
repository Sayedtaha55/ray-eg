'use client';

import { useCallback } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let toastListeners: Set<(msg: ToastMessage) => void> = new Set();

export function emitToast(title: string, description?: string, variant: ToastVariant = 'default') {
  const msg: ToastMessage = { id: Date.now().toString(), title, description, variant };
  toastListeners.forEach((fn) => fn(msg));
}

export function useToast() {
  const addToast = useCallback((title: string, description?: string, variant: ToastVariant = 'default') => {
    emitToast(title, description, variant);
  }, []);

  return { addToast };
}
