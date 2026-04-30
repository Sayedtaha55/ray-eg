import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { portalGetMe, portalUpdateMe, type PortalOwner } from '@/services/api/modules/portal';

const PortalProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [owner, setOwner] = useState<PortalOwner | null>(null);
  const [form, setForm] = useState({ name: '', email: '', avatarUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await portalGetMe();
        setOwner(me);
        setForm({ name: me.name || '', email: me.email || '', avatarUrl: me.avatarUrl || '' });
      } catch {
        navigate('/portal/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await portalUpdateMe({
        name: form.name || undefined,
        email: form.email || undefined,
        avatarUrl: form.avatarUrl || undefined,
      });
      setOwner(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('portal.profile.title')}</h1>

      {saved && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{t('portal.profile.saved')}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.profile.phoneField')}</label>
          <input type="tel" dir="ltr" value={owner?.phone || ''} disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.profile.nameField')}</label>
          <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.profile.emailField')}</label>
          <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
          <input type="url" dir="ltr" value={form.avatarUrl} onChange={(e) => setForm((p) => ({ ...p, avatarUrl: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {saving ? t('portal.profile.saving') : t('portal.profile.save')}
        </button>
      </div>
    </div>
  );
};

export default PortalProfilePage;
