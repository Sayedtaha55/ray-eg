'use client';

import { useState, useEffect, useCallback } from 'react';

const CONSENT_KEY = 'ray_consents';

type ConsentType = 'essential' | 'analytics' | 'marketing';

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultConsents: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
};

function readConsents(): ConsentState {
  if (typeof window === 'undefined') return defaultConsents;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return defaultConsents;
    return { ...defaultConsents, ...JSON.parse(raw) };
  } catch {
    return defaultConsents;
  }
}

function writeConsents(consents: ConsentState) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consents));
}

export function useConsent() {
  const [consents, setConsents] = useState<ConsentState>(defaultConsents);

  useEffect(() => {
    setConsents(readConsents());
  }, []);

  const hasConsent = useCallback(
    (type: ConsentType): boolean => {
      return consents[type] ?? false;
    },
    [consents]
  );

  const grantConsent = useCallback((type: ConsentType) => {
    setConsents((prev) => {
      const next = { ...prev, [type]: true };
      writeConsents(next);
      return next;
    });
  }, []);

  const revokeConsent = useCallback((type: ConsentType) => {
    if (type === 'essential') return; // cannot revoke essential
    setConsents((prev) => {
      const next = { ...prev, [type]: false };
      writeConsents(next);
      return next;
    });
  }, []);

  return { hasConsent, grantConsent, revokeConsent, consents };
}
