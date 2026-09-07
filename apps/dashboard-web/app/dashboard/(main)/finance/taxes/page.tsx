'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Receipt, Search, Loader2, Plus, Edit, Trash2, X, Percent, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Tax = {
  id: string;
  name: string;
  rate: number;
  taxType: 'vat' | 'wht' | 'other';
  isDefault: boolean;
  status: 'active' | 'inactive';
};

const TYPE_META: Record<string, { label: string; cls: string }> = {
  vat: { label: 'ضريبة القيمة المضافة', cls: 'bg-emerald-100 text-emerald-700' },
  wht: { label: 'استقطاع تحت حساب الضريبة', cls: 'bg-amber-100 text-amber-700' },
  other: { label: 'أخرى', cls: 'bg-slate-100 text-slate-600' },
};

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterType, setFilterType] = useState('all');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editTax, setEditTax] = useState<Tax | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [shopId, setShopId] = useState('');
  const [form, setForm] = useState({ name: '', rate: 14, taxType: 'vat' as Tax['taxType'], isDefault: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      setShopId(sid);
      const res = await apiRequest(`/accounting/tax-rates/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setTaxes(data.map((t: any) => ({
        id: String(t.id),
        name: t.name || '---',
        rate: Number(t.rate || 0),
        taxType: t.tax_type || t.taxType || 'other',
        isDefault: Boolean(t.is_default ?? t.isDefault),
        status: (t.status || 'active') as Tax['status'],
      })));
    } catch { setTaxes([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => taxes
    .filter(t => t.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter(t => filterType === 'all' || t.taxType === filterType), [taxes, debouncedSearch, filterType]);

  const openAdd = () => {
    setForm({ name: '', rate: 14, taxType: 'vat', isDefault: false });
    setEditTax(null); setError(''); setModal('add');
  };

  const openEdit = (t: Tax) => {
    setForm({ name: t.name, rate: t.rate, taxType: t.taxType, isDefault: t.isDefault });
    setEditTax(t); setError(''); setModal('edit');
  };

  const save = async () => {
    if (!form.name || form.rate < 0 || form.rate > 100) { setError('أدخل اسمًا صحيحًا ونسبة بين 0 و 100'); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'edit' && editTax) {
        await apiRequest(`/accounting/tax-rates/${editTax.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: form.name, rate: form.rate, status: editTax.status }),
        });
      } else {
        await apiRequest(`/accounting/tax-rates/shop/${shopId}`, {
          method: 'POST',
          body: JSON.stringify({ name: form.name, rate: form.rate, tax_type: form.taxType, is_default: form.isDefault }),
        });
      }
      setModal(null);
      await load();
    } catch (e: any) { setError(e?.message || 'تعذر الحفظ'); } finally { setSaving(false); }
  };

  const toggleStatus = async (t: Tax) => {
    try {
      await apiRequest(`/accounting/tax-rates/${t.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: t.status === 'active' ? 'inactive' : 'active' }),
      });
      await load();
    } catch (e: any) { alert(e?.message || 'تعذر التحديث'); }
  };

  const remove = async (t: Tax) => {
    if (!confirm(`حذف الضريبة "${t.name}"؟`)) return;
    try {
      await apiRequest(`/accounting/tax-rates/${t.id}`, { method: 'DELETE' });
      await load();
    } catch (e: any) { alert(e?.message || 'تعذر الحذف'); }
  };

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" dir="rtl">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'عدد الضرائب', val: String(taxes.length) },
          { label: 'ضرائب نشطة', val: String(taxes.filter(t => t.status === 'active').length) },
          { label: 'الضريبة الافتراضية', val: taxes.find(t => t.isDefault) ? `${taxes.find(t => t.isDefault)!.rate}%` : '—' },
          { label: 'أعلى نسبة', val: taxes.length ? `${Math.max(...taxes.map(t => t.rate))}%` : '—' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-right">
            <span className="text-slate-500 font-semibold text-xs">{s.label}</span>
            <div className="text-xl font-black text-slate-900 mt-1">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم الضريبة..." className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold bg-white">
          <option value="all">كل الأنواع</option>
          {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={26} className="animate-spin text-slate-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 font-bold text-sm">لا توجد ضرائب — أضف أول ضريبة مثل &quot;ضريبة القيمة المضافة 14%&quot;</p>
          </div>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-black text-slate-500">
                <th className="p-4 text-right">الاسم</th>
                <th className="p-4 text-right">النوع</th>
                <th className="p-4 text-left">النسبة</th>
                <th className="p-4 text-right">الحالة</th>
                <th className="p-4 text-left w-28">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800 text-sm">
                    {t.name}
                    {t.isDefault && <span className="mr-2 text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-lg font-black">افتراضية</span>}
                  </td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-black ${TYPE_META[t.taxType]?.cls || ''}`}>{TYPE_META[t.taxType]?.label || t.taxType}</span></td>
                  <td className="p-4 text-left font-mono font-black text-slate-700">{fmt(t.rate)}%</td>
                  <td className="p-4">
                    <button onClick={() => toggleStatus(t)} className={`px-2 py-1 rounded-lg text-[10px] font-black ${t.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {t.status === 'active' ? 'نشطة' : 'معطلة'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="تعديل"><Edit size={15} /></button>
                      <button onClick={() => remove(t)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-400" title="حذف"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">{modal === 'edit' ? 'تعديل ضريبة' : 'ضريبة جديدة'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">{error}</div>}
            <div>
              <label className="text-xs font-black text-slate-600 block mb-1">اسم الضريبة</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: ضريبة القيمة المضافة" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold" />
            </div>
            {modal === 'add' && (
              <>
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1">النوع</label>
                  <select value={form.taxType} onChange={e => setForm({ ...form, taxType: e.target.value as Tax['taxType'] })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold bg-white">
                    {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4" />
                  تعيين كضريبة افتراضية على الفواتير
                </label>
              </>
            )}
            <div>
              <label className="text-xs font-black text-slate-600 block mb-1">النسبة (%)</label>
              <input type="number" min={0} max={100} step="0.01" value={form.rate} onChange={e => setForm({ ...form, rate: Number(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold" dir="ltr" />
            </div>
            <button onClick={save} disabled={saving || !form.name} className="w-full bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {modal === 'edit' ? 'حفظ التعديلات' : 'إضافة الضريبة'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



