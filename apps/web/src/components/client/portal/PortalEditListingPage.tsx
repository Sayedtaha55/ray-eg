'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

const PortalEditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const router = useRouter();

  const [listing, setListing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const listings = await clientFetch<any[]>('/v1/portal/listings');
        const found = (Array.isArray(listings) ? listings : []).find((l: any) => l.id === id);
        if (!found) { router.push('/portal/listings'); return; }
        setListing(found);
        setForm({
          title: found.title || '',
          category: found.category || '',
          description: found.description || '',
          phone: found.phone || '',
          whatsapp: found.whatsapp || '',
          websiteUrl: found.websiteUrl || '',
          socialLinks: found.socialLinks || {},
          logoUrl: found.logoUrl || '',
          coverUrl: found.coverUrl || '',
        });
      } catch {
        router.push('/portal/login');
      } finally { setLoading(false); }
    })();
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('');
    try {
      await clientFetch<any>(`/v1/portal/listings/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err?.message || t('portal.common.error', 'حدث خطأ'));
    } finally { setSaving(false); }
  };

  const updateField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div dir="rtl" className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/listings" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('portal.edit.title', 'تعديل القائمة')}</h1>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {saved && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{t('portal.edit.saved', 'تم الحفظ')}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('portal.edit.basicInfo', 'معلومات أساسية')}</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.edit.titleField', 'العنوان')}</label>
          <input type="text" value={form.title || ''} onChange={e => updateField('title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.edit.categoryField', 'التصنيف')}</label>
          <input type="text" value={form.category || ''} onChange={e => updateField('category', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.edit.descriptionField', 'الوصف')}</label>
          <textarea rows={3} value={form.description || ''} onChange={e => updateField('description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('portal.edit.contactInfo', 'معلومات الاتصال')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.edit.phoneField', 'الهاتف')}</label>
            <input type="tel" dir="ltr" value={form.phone || ''} onChange={e => updateField('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.edit.whatsappField', 'واتساب')}</label>
            <input type="tel" dir="ltr" value={form.whatsapp || ''} onChange={e => updateField('whatsapp', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.edit.websiteField', 'الموقع')}</label>
            <input type="url" dir="ltr" value={form.websiteUrl || ''} onChange={e => updateField('websiteUrl', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('portal.edit.images', 'الصور')}</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.edit.logoUrlField', 'رابط الشعار')}</label>
          <input type="url" dir="ltr" value={form.logoUrl || ''} onChange={e => updateField('logoUrl', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('portal.edit.coverUrlField', 'رابط الغلاف')}</label>
          <input type="url" dir="ltr" value={form.coverUrl || ''} onChange={e => updateField('coverUrl', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
          {saving ? t('portal.edit.saving', 'جاري الحفظ') : t('portal.edit.save', 'حفظ')}
        </button>
      </div>
    </div>
  );
};

export default PortalEditListingPage;
