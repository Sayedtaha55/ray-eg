import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ShieldCheck, Clock, MapPin, Wallet, ArrowLeft } from 'lucide-react';

const { Link } = ReactRouterDOM as any;

const CourierIntroPage: React.FC = () => {
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
      title: 'طلبات قريبة منك',
      body: 'هيوصل لك عروض التوصيل الأقرب لمكانك، وأول مندوب يقبل يتم إسناد الطلب له.',
    },
    {
      icon: <Clock size={20} />,
      title: 'تحديثات تلقائية',
      body: 'لو فعّلت مشاركة الموقع، النظام هيحدّث موقعك تلقائيًا علشان مايفوتكش أي طلب.',
    },
    {
      icon: <Wallet size={20} />,
      title: 'تحصيل الكاش بسهولة',
      body: 'تقدر تتابع الطلبات وتحصيل الكاش (COD) وتحديث حالة الطلب من لوحة المندوب.',
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'تفعيل بعد المراجعة',
      body: 'بعد التسجيل، حسابك بيكون قيد المراجعة من الأدمن قبل التفعيل.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16 text-right" dir="rtl">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">للمندوبين</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
              اشتغل كمندوب توصيل على من مكانك
            </h1>
            <p className="text-slate-600 font-bold leading-relaxed">
              صفحة تعريفية سريعة قبل التسجيل: هتعرف إزاي النظام بيشتغل وإيه اللي محتاجه علشان تبدأ.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.2)] space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">قبل ما تسجّل</h2>
            <div className="space-y-2 text-slate-600 font-bold">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] mt-2" />
                <p>فعّل <span className="text-slate-900">مشاركة الموقع</span> علشان يجيلك عروض قريبة تلقائيًا.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] mt-2" />
                <p>فعّل <span className="text-slate-900">متاح لاستلام الطلبات</span> من إعدادات لوحة المندوب.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] mt-2" />
                <p>بعد قبول الطلب، هتقدر تفتح الخريطة بضغطة واحدة وتحدّث حالة الطلب بسهولة.</p>
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
                  {installing ? 'جاري الفتح...' : 'تثبيت تطبيق المندوب'}
                </button>
              ) : null}

              <Link
                to="/business/courier-signup"
                className="flex-1 text-center py-4 rounded-2xl bg-slate-900 text-white font-black"
              >
                تسجيل مندوب توصيل
              </Link>
              <Link
                to="/"
                className="flex-1 text-center py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> العودة للرئيسية
              </Link>
            </div>

            {(!canInstall && isIOS) ? (
              <div className="text-[11px] text-slate-500 font-bold">
                على iPhone: افتح زر المشاركة في Safari ثم اختر "Add to Home Screen" لتثبيت تطبيق المندوب.
              </div>
            ) : null}

            <p className="text-[11px] text-slate-500 font-bold">
              ملحوظة: التسجيل بيكون طلب انضمام، وبيتم تفعيل الحساب بعد مراجعة الأدمن.
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
        <h2 className="text-lg md:text-xl font-black text-slate-900 mb-3">أسئلة سريعة</h2>
        <div className="space-y-3 text-slate-600 font-bold text-sm">
          <div>
            <p className="text-slate-900 font-black">هل لازم أفعّل الموقع؟</p>
            <p>مستحسن جدًا. بدون الموقع ممكن يفوتك عروض كتير لأن النظام مش هيعرف يرشح لك الطلبات القريبة.</p>
          </div>
          <div>
            <p className="text-slate-900 font-black">بعد التسجيل أبدأ فورًا؟</p>
            <p>حسابك بيكون قيد المراجعة، وبعد الموافقة تقدر تسجّل دخول وتروح للوحة المندوب.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierIntroPage;
