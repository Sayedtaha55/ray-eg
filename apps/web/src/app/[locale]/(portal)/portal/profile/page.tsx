'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

export default function PortalProfilePage() {
  const t = useT();
  const router = useRouter();
  const { dir } = useLocale();
  const [owner, setOwner] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', avatarUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await clientFetch<any>('/v1/portal/me');
        setOwner(me);
        setForm({ name: me.name || '', email: me.email || '', avatarUrl: me.avatarUrl || '' });
      } catch { router.replace('/portal/login'); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const updated = await clientFetch<any>('/v1/portal/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: form.name || undefined, email: form.email || undefined, avatarUrl: form.avatarUrl || undefined }),
      });
      setOwner(updated); setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div dir={dir} className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('portal.profile.title', 'الملف الشخصي')}</h1>

      {saved && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{t('portal.profile.saved', 'تم الحفظ')}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.profile.phoneField', 'الهاتف')}</label>
          <input type="tel" dir="ltr" value={owner?.phone || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.profile.nameField', 'الاسم')}</label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.profile.emailField', 'البريد')}</label>
          <input type="email" dir="ltr" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
          <input type="url" dir="ltr" value={form.avatarUrl} onChange={e => setForm(p => ({ ...p, avatarUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
          {saving ? t('portal.profile.saving', 'جاري الحفظ...') : t('portal.profile.save', 'حفظ')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <button type="button" onClick={() => setShowPasswordSection(!showPasswordSection)} className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold text-gray-900">{t('portal.profile.changePassword', 'تغيير كلمة المرور')}</h2>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPasswordSection ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {showPasswordSection && (
          <div className="space-y-4 pt-2">
            {passwordError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{passwordError}</div>}
            {passwordSaved && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{t('portal.profile.passwordChanged', 'تم تغيير كلمة المرور')}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.profile.currentPassword', 'كلمة المرور الحالية')}</label>
              <input type="password" dir="ltr" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.profile.newPassword', 'كلمة المرور الجديدة')}</label>
              <input type="password" dir="ltr" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.profile.confirmPassword', 'تأكيد كلمة المرور')}</label>
              <input type="password" dir="ltr" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  setPasswordError(''); setPasswordSaved(false);
                  if (!currentPassword || !newPassword) { setPasswordError(t('portal.profile.passwordRequired', 'كلمة المرور مطلوبة')); return; }
                  if (newPassword.length < 8) { setPasswordError(t('portal.profile.passwordTooShort', '8 أحرف على الأقل')); return; }
                  if (newPassword !== confirmPassword) { setPasswordError(t('portal.profile.passwordMismatch', 'غير متطابقتين')); return; }
                  setPasswordSaving(true);
                  try {
                    await clientFetch<any>('/v1/portal/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
                    setPasswordSaved(true); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                    setTimeout(() => setPasswordSaved(false), 3000);
                  } catch (err: any) { setPasswordError(err?.message || t('portal.common.error', 'خطأ')); }
                  finally { setPasswordSaving(false); }
                }}
                disabled={passwordSaving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {passwordSaving ? t('portal.profile.saving', 'جاري...') : t('portal.profile.changePassword', 'تغيير')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
