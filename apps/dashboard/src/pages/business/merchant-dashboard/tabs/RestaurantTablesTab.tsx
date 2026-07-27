import React, { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Plus, Trash2, Edit3, X, Users, CheckCircle2, Clock, Ban, Search } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';

type TableStatus = 'available' | 'reserved' | 'maintenance';

type RestaurantTable = {
  id: string;
  name: string;
  capacity: number;
  section: string;
  status: TableStatus;
};

type Props = { shop: any; onSaved?: () => void };

const EMPTY_FORM = { name: '', capacity: '4', section: '', status: 'available' as TableStatus };

const STATUS_META: Record<TableStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  available: { label: 'متاحة', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', icon: <CheckCircle2 size={14} /> },
  reserved: { label: 'محجوزة', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100', icon: <Clock size={14} /> },
  maintenance: { label: 'غير متاحة', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200', icon: <Ban size={14} /> },
};

const STATUS_CYCLE: TableStatus[] = ['available', 'reserved', 'maintenance'];

const RestaurantTablesTab: React.FC<Props> = ({ shop, onSaved }) => {
  const { addToast } = useToast();
  const [tables, setTables] = useState<RestaurantTable[]>(
    Array.isArray(shop?.pageDesign?.restaurantTables) ? shop.pageDesign.restaurantTables : [],
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ApiService.getMyShop()
      .then((fresh: any) => {
        if (cancelled) return;
        const list = Array.isArray(fresh?.pageDesign?.restaurantTables) ? fresh.pageDesign.restaurantTables : [];
        setTables(list);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = async (next: RestaurantTable[]) => {
    setSaving(true);
    try {
      const fresh = await ApiService.getMyShop().catch(() => shop);
      const prevPageDesign = (fresh?.pageDesign && typeof fresh.pageDesign === 'object') ? fresh.pageDesign : {};
      const nextPageDesign = { ...prevPageDesign, restaurantTables: next };
      await ApiService.updateMyShop({ pageDesign: nextPageDesign });
      setTables(next);
      onSaved?.();
    } catch (e: any) {
      addToast('فشل حفظ الطاولات، حاول مرة أخرى.', 'error');
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const sections = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => {
      const s = String(t.section || '').trim();
      if (s) set.add(s);
    });
    return Array.from(set);
  }, [tables]);

  const filtered = useMemo(() => {
    return tables.filter((t) => {
      if (sectionFilter !== 'all' && String(t.section || '').trim() !== sectionFilter) return false;
      if (search && !String(t.name || '').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tables, search, sectionFilter]);

  const counts = useMemo(() => {
    return {
      total: tables.length,
      available: tables.filter((t) => t.status === 'available').length,
      reserved: tables.filter((t) => t.status === 'reserved').length,
      maintenance: tables.filter((t) => t.status === 'maintenance').length,
    };
  }, [tables]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (table: RestaurantTable) => {
    setEditingId(table.id);
    setForm({
      name: table.name,
      capacity: String(table.capacity || ''),
      section: table.section || '',
      status: table.status || 'available',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const submitForm = async () => {
    const name = String(form.name || '').trim();
    if (!name) {
      addToast('اسم الطاولة مطلوب.', 'error');
      return;
    }
    const capacity = Math.max(1, parseInt(form.capacity, 10) || 1);
    const section = String(form.section || '').trim();

    let next: RestaurantTable[];
    if (editingId) {
      next = tables.map((t) =>
        t.id === editingId ? { ...t, name, capacity, section, status: form.status } : t,
      );
    } else {
      const newTable: RestaurantTable = {
        id: `table-${Date.now()}`,
        name,
        capacity,
        section,
        status: form.status,
      };
      next = [...tables, newTable];
    }

    try {
      await persist(next);
      closeModal();
      addToast(editingId ? 'تم تحديث الطاولة بنجاح.' : 'تمت إضافة الطاولة بنجاح.', 'success');
    } catch {
      // toast already shown in persist
    }
  };

  const removeTable = async (id: string) => {
    const ok = typeof window !== 'undefined' ? window.confirm('هل أنت متأكد من حذف هذه الطاولة؟') : false;
    if (!ok) return;
    const next = tables.filter((t) => t.id !== id);
    try {
      await persist(next);
      addToast('تم حذف الطاولة.', 'success');
    } catch {
      // toast already shown in persist
    }
  };

  const cycleStatus = async (table: RestaurantTable) => {
    const idx = STATUS_CYCLE.indexOf(table.status);
    const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    const next = tables.map((t) => (t.id === table.id ? { ...t, status: nextStatus } : t));
    try {
      await persist(next);
    } catch {
      // toast already shown in persist
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-center py-20">
          <span className="text-slate-400 font-black">جاري تحميل الطاولات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <LayoutGrid size={22} style={{ color: '#00E5FF' }} />
              الطاولات والقاعات
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-400 mt-2">
              أضف طاولاتك وقاعاتك، وتابع حالتها (متاحة / محجوزة / غير متاحة) في مكان واحد.
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: '#0F172A' }}
          >
            <Plus size={16} />
            إضافة طاولة
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
            <div className="text-2xl font-black text-slate-900">{counts.total}</div>
            <div className="text-[10px] font-black text-slate-400 mt-1">إجمالي الطاولات</div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
            <div className="text-2xl font-black text-emerald-700">{counts.available}</div>
            <div className="text-[10px] font-black text-emerald-500 mt-1">متاحة</div>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center">
            <div className="text-2xl font-black text-amber-700">{counts.reserved}</div>
            <div className="text-[10px] font-black text-amber-500 mt-1">محجوزة</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-center">
            <div className="text-2xl font-black text-slate-600">{counts.maintenance}</div>
            <div className="text-[10px] font-black text-slate-400 mt-1">غير متاحة</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث باسم الطاولة..."
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-400"
            />
          </div>
          {sections.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSectionFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${
                  sectionFilter === 'all' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                الكل
              </button>
              {sections.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSectionFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${
                    sectionFilter === s ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutGrid size={40} className="text-slate-200 mb-4" />
            <p className="text-sm font-black text-slate-400">
              {tables.length === 0 ? 'لا توجد طاولات بعد. أضف أول طاولة لبدء إدارة القاعة.' : 'لا توجد نتائج مطابقة.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((table) => {
              const meta = STATUS_META[table.status] || STATUS_META.available;
              return (
                <div
                  key={table.id}
                  className="rounded-[1.75rem] border border-slate-100 p-5 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="font-black text-slate-900 text-sm">{table.name}</div>
                      {table.section && (
                        <div className="text-[10px] font-black text-slate-400 mt-1">{table.section}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(table)}
                        className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTable(table.id)}
                        disabled={saving}
                        className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-600 flex items-center justify-center transition-all disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4">
                    <Users size={14} />
                    <span>{table.capacity} أفراد</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => cycleStatus(table)}
                    disabled={saving}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-black transition-all disabled:opacity-60 ${meta.bg} ${meta.color}`}
                  >
                    {meta.icon}
                    {meta.label}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                {editingId ? 'تعديل الطاولة' : 'إضافة طاولة جديدة'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم الطاولة</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="مثال: طاولة 1 / تراس 3"
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">عدد الكراسي</label>
                  <input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">القسم / القاعة</label>
                  <input
                    value={form.section}
                    onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                    placeholder="مثال: الصالة الداخلية"
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {STATUS_CYCLE.map((s) => {
                    const meta = STATUS_META[s];
                    const active = form.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, status: s }))}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-[11px] font-black transition-all ${
                          active ? `${meta.bg} ${meta.color} border-2` : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {meta.icon}
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={submitForm}
                disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all disabled:opacity-60"
              >
                {saving ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة الطاولة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantTablesTab;
