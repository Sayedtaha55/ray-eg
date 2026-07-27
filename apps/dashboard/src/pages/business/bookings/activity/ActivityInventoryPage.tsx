/**
 * ═══════════════════════════════════════════
 * activity/ActivityInventoryPage.tsx
 * المخزون الطبي — إدارة الأدوية والمستلزمات الطبية
 * يُستخدم في: العيادات، المستشفيات
 * ═══════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, Loader2, Pill, Syringe, Badge, Heart, Boxes, TrendingDown, CalendarX, Wallet } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';

type InventoryItem = {
  id: string;
  name: string;
  category: 'medication' | 'supply' | 'equipment' | 'other';
  unit: string;
  quantity: number;
  minQuantity: number;
  expiryDate?: string;
  batchNumber?: string;
  costPerUnit?: number;
  notes?: string;
};

type Props = { activityType: BookingActivityType };

const ActivityInventoryPage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({
    name: '', category: 'medication' as InventoryItem['category'], unit: '', quantity: '', minQuantity: '',
    expiryDate: '', batchNumber: '', costPerUnit: '', notes: '',
  });

  const loadItems = async () => {
    setLoading(true);
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) { setLoading(false); return; }
      const data = await ApiService.getBookingActivityData(shop.id, 'activityInventoryList');
      if (Array.isArray(data)) setItems(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const saveItems = async (next: InventoryItem[]) => {
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      await ApiService.saveBookingActivityData(shop.id, 'activityInventoryList', next);
      setItems(next);
    } catch {}
  };

  const resetForm = () => {
    setForm({ name: '', category: 'medication', unit: '', quantity: '', minQuantity: '', expiryDate: '', batchNumber: '', costPerUnit: '', notes: '' });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const item: InventoryItem = {
      id: editingItem?.id || `inv-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      unit: form.unit || (isEn ? 'unit' : 'وحدة'),
      quantity: Number(form.quantity) || 0,
      minQuantity: Number(form.minQuantity) || 0,
      expiryDate: form.expiryDate || undefined,
      batchNumber: form.batchNumber || undefined,
      costPerUnit: form.costPerUnit ? Number(form.costPerUnit) : undefined,
      notes: form.notes || undefined,
    };
    if (editingItem) {
      await saveItems(items.map(i => i.id === editingItem.id ? item : i));
    } else {
      await saveItems([...items, item]);
    }
    resetForm();
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name, category: item.category, unit: item.unit,
      quantity: String(item.quantity), minQuantity: String(item.minQuantity),
      expiryDate: item.expiryDate || '', batchNumber: item.batchNumber || '',
      costPerUnit: item.costPerUnit ? String(item.costPerUnit) : '', notes: item.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isEn ? 'Are you sure?' : 'هل أنت متأكد من الحذف؟')) return;
    await saveItems(items.filter(i => i.id !== id));
  };

  const categoryConfig: Record<InventoryItem['category'], { label: string; labelEn: string; icon: React.ReactNode; color: string }> = {
    medication: { label: 'أدوية', labelEn: 'Medication', icon: <Pill size={14} />, color: 'text-violet-600 bg-violet-50' },
    supply: { label: 'مستلزمات', labelEn: 'Supplies', icon: <Badge size={14} />, color: 'text-cyan-600 bg-cyan-50' },
    equipment: { label: 'أجهزة', labelEn: 'Equipment', icon: <Heart size={14} />, color: 'text-rose-600 bg-rose-50' },
    other: { label: 'أخرى', labelEn: 'Other', icon: <Package size={14} />, color: 'text-slate-600 bg-slate-50' },
  };

  const filtered = items.filter(i =>
    !search ||
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.batchNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = items.filter(i => i.quantity <= i.minQuantity);
  const expiringSoon = items.filter(i => {
    if (!i.expiryDate) return false;
    const days = (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days <= 30 && days >= 0;
  });
  const expired = items.filter(i => {
    if (!i.expiryDate) return false;
    return new Date(i.expiryDate).getTime() < Date.now();
  });

  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
  const totalValue = items.reduce((s, i) => s + (i.costPerUnit || 0) * i.quantity, 0);
  const totalItems = items.length;
  const categoryCounts = {
    medication: items.filter(i => i.category === 'medication').length,
    supply: items.filter(i => i.category === 'supply').length,
    equipment: items.filter(i => i.category === 'equipment').length,
    other: items.filter(i => i.category === 'other').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Package className="text-cyan-600" size={22} />
            {isEn ? 'Medical Inventory' : 'المخزون الطبي'}
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">
            {isEn ? 'Manage medications, supplies & equipment' : 'إدارة الأدوية والمستلزمات والأجهزة الطبية'}
          </p>
        </div>
        <button onClick={() => { setEditingItem(null); resetForm(); setShowForm(true); }}
          className="px-4 py-2.5 rounded-2xl bg-cyan-600 text-white text-xs font-black hover:bg-cyan-700 flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={16} /> {isEn ? 'Add Item' : 'إضافة صنف'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">{isEn ? 'Total Items' : 'إجمالي الأصناف'}</span>
            <Boxes size={16} className="text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalItems}</div>
          <div className="text-[10px] font-bold text-slate-300 mt-0.5">
            {categoryCounts.medication} {isEn ? 'med' : 'دواء'} • {categoryCounts.supply} {isEn ? 'supply' : 'مستلزم'} • {categoryCounts.equipment} {isEn ? 'equip' : 'جهاز'}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">{isEn ? 'Total Quantity' : 'إجمالي الكمية'}</span>
            <Package size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{totalQuantity.toLocaleString()}</div>
          <div className="text-[10px] font-bold text-slate-300 mt-0.5">{isEn ? 'units in stock' : 'وحدة في المخزون'}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">{isEn ? 'Inventory Value' : 'قيمة المخزون'}</span>
            <Wallet size={16} className="text-violet-500" />
          </div>
          <div className="text-2xl font-black text-violet-700">{totalValue.toLocaleString()}</div>
          <div className="text-[10px] font-bold text-slate-300 mt-0.5">{isEn ? 'EGP' : 'ج.م'}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">{isEn ? 'Alerts' : 'تنبيهات'}</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{lowStock.length + expired.length + expiringSoon.length}</div>
          <div className="text-[10px] font-bold mt-0.5 flex flex-wrap gap-x-2">
            {lowStock.length > 0 && <span className="text-orange-500">{lowStock.length} {isEn ? 'low' : 'منخفض'}</span>}
            {expired.length > 0 && <span className="text-red-500">{expired.length} {isEn ? 'expired' : 'منتهي'}</span>}
            {expiringSoon.length > 0 && <span className="text-amber-500">{expiringSoon.length} {isEn ? 'soon' : 'قريب'}</span>}
            {lowStock.length + expired.length + expiringSoon.length === 0 && <span className="text-emerald-500">{isEn ? 'All good ✓' : 'كله تمام ✓'}</span>}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(lowStock.length > 0 || expired.length > 0 || expiringSoon.length > 0) && (
        <div className="space-y-2">
          {expired.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs font-bold text-red-700">
              <AlertTriangle size={14} /> {isEn ? `${expired.length} expired item(s)` : `${expired.length} صنف منتهي الصلاحية`}
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-bold text-amber-700">
              <AlertTriangle size={14} /> {isEn ? `${expiringSoon.length} item(s) expiring within 30 days` : `${expiringSoon.length} صنف ينتهي خلال 30 يوم`}
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-xs font-bold text-orange-700">
              <AlertTriangle size={14} /> {isEn ? `${lowStock.length} item(s) low in stock` : `${lowStock.length} صنف منخفض المخزون`}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={isEn ? 'Search by name or batch number...' : 'بحث بالاسم أو رقم التشغيلة...'}
          className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-400" />
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">
              {editingItem ? (isEn ? 'Edit Item' : 'تعديل صنف') : (isEn ? 'New Item' : 'صنف جديد')}
            </h3>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">{isEn ? 'Name' : 'الاسم'}</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-right focus:outline-none focus:border-cyan-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">{isEn ? 'Category' : 'التصنيف'}</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-400">
                <option value="medication">{isEn ? 'Medication' : 'أدوية'}</option>
                <option value="supply">{isEn ? 'Supplies' : 'مستلزمات'}</option>
                <option value="equipment">{isEn ? 'Equipment' : 'أجهزة'}</option>
                <option value="other">{isEn ? 'Other' : 'أخرى'}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">{isEn ? 'Unit' : 'الوحدة'}</label>
              <input type="text" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder={isEn ? 'e.g. box, vial, piece' : 'مثال: علبة، أمبول، قطعة'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-right focus:outline-none focus:border-cyan-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">{isEn ? 'Quantity' : 'الكمية'}</label>
              <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-right focus:outline-none focus:border-cyan-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">{isEn ? 'Min. Quantity (alert)' : 'الحد الأدنى (تنبيه)'}</label>
              <input type="number" value={form.minQuantity} onChange={e => setForm(f => ({ ...f, minQuantity: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-right focus:outline-none focus:border-cyan-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">{isEn ? 'Expiry Date' : 'تاريخ الانتهاء'}</label>
              <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">{isEn ? 'Batch Number' : 'رقم التشغيلة'}</label>
              <input type="text" value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-right focus:outline-none focus:border-cyan-400" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500">{isEn ? 'Cost per Unit (EGP)' : 'التكلفة للوحدة (ج.م)'}</label>
              <input type="number" value={form.costPerUnit} onChange={e => setForm(f => ({ ...f, costPerUnit: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-right focus:outline-none focus:border-cyan-400" />
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <label className="text-[10px] font-black text-slate-500">{isEn ? 'Notes' : 'ملاحظات'}</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-right focus:outline-none focus:border-cyan-400" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSubmit} disabled={!form.name.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-black hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-1.5">
              {editingItem ? (isEn ? 'Save Changes' : 'حفظ التعديلات') : (isEn ? 'Add Item' : 'إضافة')}
            </button>
            <button onClick={resetForm}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-500 hover:bg-slate-50">
              {isEn ? 'Cancel' : 'إلغاء'}
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-slate-200 mb-3" />
          <p className="text-sm font-bold text-slate-400">
            {search ? (isEn ? 'No items found' : 'لا توجد نتائج') : (isEn ? 'No items in inventory yet' : 'لا يوجد مخزون بعد')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => {
            const cat = categoryConfig[item.category];
            const isLow = item.quantity <= item.minQuantity;
            const isExpired = item.expiryDate && new Date(item.expiryDate).getTime() < Date.now();
            const isExpiringSoon = item.expiryDate && !isExpired && (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${cat.color}`}>{cat.icon}</span>
                    <div>
                      <div className="text-sm font-black text-slate-900">{item.name}</div>
                      <div className="text-[10px] font-bold text-slate-400">{isEn ? cat.labelEn : cat.label}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit2 size={12} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                  <span className={`px-2 py-0.5 rounded-lg ${isLow ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isEn ? 'Qty:' : 'الكمية:'} {item.quantity} {item.unit}
                  </span>
                  {item.minQuantity > 0 && (
                    <span className="text-slate-400">{isEn ? `Min: ${item.minQuantity}` : `الحد الأدنى: ${item.minQuantity}`}</span>
                  )}
                </div>
                {item.batchNumber && (
                  <div className="text-[10px] font-bold text-slate-400">{isEn ? 'Batch:' : 'تشغيلة:'} {item.batchNumber}</div>
                )}
                {item.expiryDate && (
                  <div className={`text-[10px] font-bold flex items-center gap-1 ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-400'}`}>
                    <AlertTriangle size={10} />
                    {isEn ? 'Expiry:' : 'انتهاء:'} {item.expiryDate}
                    {isExpired && (isEn ? ' (Expired)' : ' (منتهي)')}
                    {isExpiringSoon && (isEn ? ' (Soon)' : ' (قريب)')}
                  </div>
                )}
                {item.costPerUnit && (
                  <div className="text-[10px] font-bold text-slate-400">
                    {isEn ? `Cost: ${item.costPerUnit} EGP/${item.unit}` : `التكلفة: ${item.costPerUnit} ج.م/${item.unit}`}
                  </div>
                )}
                {item.notes && (
                  <p className="text-[10px] text-slate-400 font-bold bg-slate-50 rounded-lg px-2 py-1">{item.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityInventoryPage;
