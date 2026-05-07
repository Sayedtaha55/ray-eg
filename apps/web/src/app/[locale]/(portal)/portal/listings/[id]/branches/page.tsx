'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

type Branch = {
  id: string;
  name: string | null;
  latitude: number;
  longitude: number;
  addressLabel: string | null;
  governorate: string | null;
  city: string | null;
  phone: string | null;
  isPrimary: boolean;
};

export default function PortalBranchesPage() {
  const t = useT();
  const router = useRouter();
  const params = useParams();
  const { dir } = useLocale();
  const listingId = String(params?.id || '');

  const [listing, setListing] = useState<any>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const emptyBranch = { name: '', latitude: 30.0444, longitude: 31.2357, addressLabel: '', governorate: '', city: '', phone: '' };
  const [newBranch, setNewBranch] = useState(emptyBranch);
  const [editBranch, setEditBranch] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      try {
        const listings = await clientFetch<any[]>('/v1/portal/listings');
        const list = Array.isArray(listings) ? listings : [];
        const found = list.find((l: any) => l.id === listingId);
        if (!found) { router.replace('/portal/listings'); return; }
        setListing(found);
        setBranches(found.branches || []);
      } catch { router.replace('/portal/login'); }
      finally { setLoading(false); }
    })();
  }, [listingId, router]);

  const handleAddBranch = async () => {
    setSaving(true); setError('');
    try {
      const res = await clientFetch<any>(`/v1/portal/listings/${listingId}/branches`, {
        method: 'POST',
        body: JSON.stringify({
          name: newBranch.name || undefined,
          latitude: Number(newBranch.latitude),
          longitude: Number(newBranch.longitude),
          addressLabel: newBranch.addressLabel || undefined,
          governorate: newBranch.governorate || undefined,
          city: newBranch.city || undefined,
          phone: newBranch.phone || undefined,
        }),
      });
      setBranches(prev => [...prev, res]);
      setShowAdd(false); setNewBranch(emptyBranch);
    } catch (err: any) { setError(err?.message || t('portal.common.error', 'خطأ')); }
    finally { setSaving(false); }
  };

  const handleEditBranch = async (branchId: string) => {
    setSaving(true); setError('');
    try {
      const res = await clientFetch<any>(`/v1/portal/listings/${listingId}/branches/${branchId}`, {
        method: 'PATCH',
        body: JSON.stringify(editBranch),
      });
      setBranches(prev => prev.map(b => b.id === branchId ? { ...b, ...res } : b));
      setEditingId(null); setEditBranch({});
    } catch (err: any) { setError(err?.message || t('portal.common.error', 'خطأ')); }
    finally { setSaving(false); }
  };

  const handleSetPrimary = async (branchId: string) => {
    try {
      await clientFetch<any>(`/v1/portal/listings/${listingId}/branches/${branchId}/set-primary`, { method: 'PATCH' });
      setBranches(prev => prev.map(b => ({ ...b, isPrimary: b.id === branchId })));
    } catch (err: any) { setError(err?.message || t('portal.common.error', 'خطأ')); }
  };

  const startEdit = (b: Branch) => {
    setEditingId(b.id);
    setEditBranch({ name: b.name || '', addressLabel: b.addressLabel || '', governorate: b.governorate || '', city: b.city || '', phone: b.phone || '', latitude: b.latitude, longitude: b.longitude });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div dir={dir} className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/listings" className="text-gray-400 hover:text-gray-600"><ArrowRight size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('portal.branches.title', 'الفروع')} — {listing?.title}</h1>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="flex justify-end">
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t('portal.branches.addBranch', 'إضافة فرع')}</button>
      </div>

      {branches.length === 0 && !showAdd ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><p className="text-gray-500">{t('portal.branches.noBranches', 'لا توجد فروع')}</p></div>
      ) : (
        <div className="space-y-3">
          {branches.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4">
              {editingId === b.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder={t('portal.branches.nameField', 'الاسم')} value={editBranch.name || ''} onChange={e => setEditBranch(p => ({ ...p, name: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="text" placeholder={t('portal.branches.phoneField', 'الهاتف')} value={editBranch.phone || ''} onChange={e => setEditBranch(p => ({ ...p, phone: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="text" placeholder={t('portal.branches.addressField', 'العنوان')} value={editBranch.addressLabel || ''} onChange={e => setEditBranch(p => ({ ...p, addressLabel: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="text" placeholder={t('portal.branches.governorateField', 'المحافظة')} value={editBranch.governorate || ''} onChange={e => setEditBranch(p => ({ ...p, governorate: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="text" placeholder={t('portal.branches.cityField', 'المدينة')} value={editBranch.city || ''} onChange={e => setEditBranch(p => ({ ...p, city: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-gray-600 text-sm">{t('portal.common.cancel', 'إلغاء')}</button>
                    <button onClick={() => handleEditBranch(b.id)} disabled={saving} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm disabled:bg-blue-400">{saving ? t('portal.branches.saving', 'جاري...') : t('portal.branches.save', 'حفظ')}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{b.name || t('portal.branches.nameField', 'فرع')}</h3>
                      {b.isPrimary && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{t('portal.branches.isPrimary', 'رئيسي')}</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{[b.addressLabel, b.governorate, b.city].filter(Boolean).join(' • ')}</p>
                    {b.phone && <p className="text-sm text-gray-400 mt-0.5" dir="ltr">{b.phone}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!b.isPrimary && <button onClick={() => handleSetPrimary(b.id)} className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">{t('portal.branches.setPrimary', 'تعيين رئيسي')}</button>}
                    <button onClick={() => startEdit(b)} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">{t('portal.branches.editBranch', 'تعديل')}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{t('portal.branches.addBranch', 'إضافة فرع')}</h2>
            <div className="space-y-3">
              <input type="text" placeholder={t('portal.branches.nameField', 'الاسم')} value={newBranch.name} onChange={e => setNewBranch(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder={t('portal.branches.addressField', 'العنوان')} value={newBranch.addressLabel} onChange={e => setNewBranch(p => ({ ...p, addressLabel: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder={t('portal.branches.governorateField', 'المحافظة')} value={newBranch.governorate} onChange={e => setNewBranch(p => ({ ...p, governorate: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
                <input type="text" placeholder={t('portal.branches.cityField', 'المدينة')} value={newBranch.city} onChange={e => setNewBranch(p => ({ ...p, city: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <input type="text" placeholder={t('portal.branches.phoneField', 'الهاتف')} dir="ltr" value={newBranch.phone} onChange={e => setNewBranch(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="any" placeholder={t('portal.branches.latitude', 'خط العرض')} dir="ltr" value={newBranch.latitude} onChange={e => setNewBranch(p => ({ ...p, latitude: Number(e.target.value) }))} className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" step="any" placeholder={t('portal.branches.longitude', 'خط الطول')} dir="ltr" value={newBranch.longitude} onChange={e => setNewBranch(p => ({ ...p, longitude: Number(e.target.value) }))} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowAdd(false); setNewBranch(emptyBranch); }} className="px-4 py-2 text-gray-600 text-sm">{t('portal.common.cancel', 'إلغاء')}</button>
              <button onClick={handleAddBranch} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:bg-blue-400">{saving ? t('portal.branches.saving', 'جاري...') : t('portal.branches.save', 'حفظ')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
