import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
import { ShieldCheck, Clock, MapPin, Wallet, ArrowLeft } from 'lucide-react';

const { Link } = ReactRouterDOM as any;

const CourierIntroPage: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);

  const isIOS = useMemo(() => {
    try {
      const ua = String(navigator.userAgent || '');
      const iOS = /iPad|iPhone|iPod/.test(ua);
      const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|Edg/.test(ua);
      return iOS && isSafari;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: any) => {
      try {
        e.preventDefault();
      } catch {
      }
      setDeferredPrompt(e);
    };

    try {
      window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
    } catch {
    }
    return () => {
      try {
        window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
      } catch {
      }
    };
  }, []);

  const canInstall = !!deferredPrompt;

  const features = [
    {
      icon: <MapPin size={20} />,
      title: t('courier.f1Title'),
      body: t('courier.f1Body'),
    },
    {
      icon: <Clock size={20} />,
      title: t('courier.f2Title'),
      body: t('courier.f2Body'),
    },
    {
      icon: <Wallet size={20} />,
      title: t('courier.f3Title'),
      body: t('courier.f3Body'),
    },
    {
      icon: <ShieldCheck size={20} />,
      title: t('courier.f4Title'),
      body: t('courier.f4Body'),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16 text-right" dir="rtl">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t('courier.badge')}</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
              {t('courier.title')}
            </h1>
            <p className="text-slate-600 font-bold leading-relaxed">
              {t('courier.intro')}
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.2)] space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{t('courier.beforeTitle')}</h2>
            <div className="space-y-2 text-slate-600 font-bold">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] mt-2" />
                <p>{t('courier.tip1').split(t('courier.tip1Highlight'))[0]}<span className="text-slate-900">{t('courier.tip1Highlight')}</span>{t('courier.tip1').split(t('courier.tip1Highlight'))[1] || ''}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] mt-2" />
                <p>{t('courier.tip2').split(t('courier.tip2Highlight'))[0]}<span className="text-slate-900">{t('courier.tip2Highlight')}</span>{t('courier.tip2').split(t('courier.tip2Highlight'))[1] || ''}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] mt-2" />
                <p>{t('courier.tip3')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {canInstall ? (
                <button
                  type="button"
                  disabled={installing}
                  onClick={async () => {
                    if (!deferredPrompt) return;
                    setInstalling(true);
                    try {
                      await deferredPrompt.prompt();
                      try {
                        await deferredPrompt.userChoice;
                      } catch {
                      }
                    } catch {
                    } finally {
                      setDeferredPrompt(null);
                      setInstalling(false);
                    }
                  }}
                  className="flex-1 text-center py-4 rounded-2xl bg-[#00E5FF] text-slate-900 font-black"
                >
                  {installing ? t('courier.installing') : t('courier.installApp')}
                </button>
              ) : null}

              <Link
                to="/business/courier-signup"
                className="flex-1 text-center py-4 rounded-2xl bg-slate-900 text-white font-black"
              >
                {t('courier.signup')}
              </Link>
              <Link
                to="/"
                className="flex-1 text-center py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> {t('courier.backHome')}
              </Link>
            </div>

            {(!canInstall && isIOS) ? (
              <div className="text-[11px] text-slate-500 font-bold">
                {t('courier.iosNote')}
              </div>
            ) : null}

            <p className="text-[11px] text-slate-500 font-bold">
              {t('courier.note')}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, idx) => (
            <div key={idx} className="bg-slate-900 text-white border border-white/5 rounded-[2.25rem] p-6 md:p-7">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg md:text-xl font-black mb-2">{f.title}</h3>
              <p className="text-slate-300 font-bold text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 md:mt-14 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 md:p-8">
        <h2 className="text-lg md:text-xl font-black text-slate-900 mb-3">{t('courier.faqTitle')}</h2>
        <div className="space-y-3 text-slate-600 font-bold text-sm">
          <div>
            <p className="text-slate-900 font-black">{t('courier.faq1Q')}</p>
            <p>{t('courier.faq1A')}</p>
          </div>
          <div>
            <p className="text-slate-900 font-black">{t('courier.faq2Q')}</p>
            <p>{t('courier.faq2A')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierIntroPage;
