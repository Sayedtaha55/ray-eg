import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { portalRequestOtp, portalVerifyOtp } from '@/services/api/modules/portal';

const PortalLoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRtl = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');

  useEffect(() => {
    const p = String(searchParams.get('phone') || '').trim();
    if (p) {
      setPhone(p);
    }
  }, [searchParams]);

  const handleSendOtp = async () => {
    setError('');
    if (!phone.trim()) {
      setError(t('portal.login.errorPhone'));
      return;
    }
    setLoading(true);
    try {
      const res = await portalRequestOtp(phone);
      if (res.devCode) setDevCode(res.devCode);
      setStep('code');
    } catch (err: any) {
      setError(err?.message || t('portal.common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!code.trim()) {
      setError(t('portal.login.errorCode'));
      return;
    }
    setLoading(true);
    try {
      const res = await portalVerifyOtp(phone, code);
      localStorage.setItem('portal_token', res.access_token);
      localStorage.setItem('portal_owner', JSON.stringify(res.owner));
      navigate('/portal');
    } catch (err: any) {
      setError(err?.message || t('portal.common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('portal.login.title')}</h1>
            <p className="text-gray-500 mt-2 text-sm">{t('portal.login.subtitle')}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Phone */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('portal.login.phonePlaceholder').split('(')[0]}
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('portal.login.phonePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
              >
                {loading ? t('portal.login.sending') : t('portal.login.sendOtp')}
              </button>
            </div>
          )}

          {/* Step 2: OTP Code */}
          {step === 'code' && (
            <div className="space-y-4">
              {devCode && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm text-center font-mono text-lg">
                  {t('portal.login.devCodeHint', { code: devCode })}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('portal.login.codePlaceholder')}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-2xl tracking-[0.5em] font-mono"
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
              >
                {loading ? t('portal.login.verifying') : t('portal.login.verifyOtp')}
              </button>
              <button
                onClick={() => { setStep('phone'); setCode(''); setDevCode(''); }}
                className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {t('portal.login.resendOtp')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalLoginPage;
