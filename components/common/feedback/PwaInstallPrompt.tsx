import React, { useEffect, useMemo, useState } from 'react';
import { Download, Share2, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome?: 'accepted' | 'dismissed'; platform?: string }>;
};

const DISMISS_KEY = 'ray_pwa_install_dismissed_until';
const DISMISS_MS = 3 * 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any)?.standalone === true;
  } catch {
    return false;
  }
}

function isIosSafari() {
  if (typeof navigator === 'undefined') return false;
  const ua = String(navigator.userAgent || '').toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isWebkit = /webkit/.test(ua);
  const isCrios = /crios|fxios|edgios/.test(ua);
  return isIos && isWebkit && !isCrios;
}

const PwaInstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEventLike | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const standalone = useMemo(() => isStandaloneMode(), []);
  const iosSafari = useMemo(() => isIosSafari(), []);

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(DISMISS_KEY) || '0');
      if (Number.isFinite(until) && until > Date.now()) {
        setDismissed(true);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault?.();
      setDeferredPrompt(event as BeforeInstallPromptEventLike);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setDismissed(true);
      try {
        localStorage.removeItem(DISMISS_KEY);
      } catch {
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', onAppInstalled as any);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', onAppInstalled as any);
    };
  }, []);

  const closePrompt = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS));
    } catch {
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome !== 'accepted') {
        closePrompt();
      } else {
        setDismissed(true);
      }
    } catch {
      closePrompt();
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const shouldShow = !standalone && !dismissed && (Boolean(deferredPrompt) || iosSafari);
  if (!shouldShow) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[160] px-4 pb-4 md:px-6"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
    >
      <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] p-4 md:p-5 text-right">
        <div className="flex items-start gap-3 flex-row-reverse">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-[#00E5FF]/15 text-slate-900 flex items-center justify-center">
            {iosSafari ? <Share2 size={20} /> : <Download size={20} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className="text-sm md:text-base font-black text-slate-900">{t('common.pwaInstallPrompt.title')}</span>
              <Smartphone size={16} className="text-slate-500" />
            </div>
            {iosSafari ? (
              <p className="text-xs md:text-sm text-slate-600 leading-7">
                {t('common.pwaInstallPrompt.iosDescPrefix')} <span className="font-black">{t('common.pwaInstallPrompt.iosShare')}</span> {t('common.pwaInstallPrompt.iosDescMiddle')} <span className="font-black">{t('common.pwaInstallPrompt.iosAddToHome')}</span> {t('common.pwaInstallPrompt.iosDescSuffix')}
              </p>
            ) : (
              <p className="text-xs md:text-sm text-slate-600 leading-7">
                {t('common.pwaInstallPrompt.desc')}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 justify-end">
              {!iosSafari && deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstall}
                  disabled={installing}
                  className="rounded-full bg-slate-900 text-white px-4 py-2 text-xs md:text-sm font-black disabled:opacity-60"
                >
                  {installing ? t('common.pwaInstallPrompt.installing') : t('common.pwaInstallPrompt.installNow')}
                </button>
              ) : null}
              <button
                type="button"
                onClick={closePrompt}
                className="rounded-full bg-slate-100 text-slate-700 px-4 py-2 text-xs md:text-sm font-black"
              >
                {t('common.pwaInstallPrompt.later')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
