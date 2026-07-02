/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingServicesPage.tsx
 * صفحة الخدمات - تخصصات، خدمات تجميل، إلخ
 * ═══════════════════════════════════════════
 */
import React, { useEffect, useState } from 'react';
import { Scissors, Plus, Loader2, Search, PackagePlus, Trash2, X } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { getVocabulary } from '../config';
import { ApiService } from '@/services/api.service';

type Props = {
  activityType: BookingActivityType;
  loading?: boolean;
};

const BookingServicesPage: React.FC<Props> = ({ activityType }) => {
  const vocab = getVocabulary(activityType);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
    if (!shop?.id) { setLoading(false); return; }

    ApiService.getShopServices?.(shop.id, activityType)
      .then((data: any) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [activityType]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
    if (!shop?.id) return;

    setSubmitting(true);
    try {
      await ApiService.addShopService?.({
        shopId: shop.id,
        activityType,
        name: name.trim(),
        price: Number(price) || 0,
        duration: Number(duration) || 30,
      });
      setName('');
      setPrice('');
      setDuration('30');
      setIsModalOpen(false);
      loadData();
    } catch {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
    try {
      await ApiService.deleteShopService?.(id, activityType);
      loadData();
    } catch {
      // error handling
    }
  };

  const filtered = services.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-bold text-slate-400">جاري تحميل {vocab.serviceSingular}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">{vocab.servicePlural}</h2>
            <p className="text-xs text-slate-500">{services.length} {vocab.serviceSingular}</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة {vocab.serviceSingular}
        </button>
      </div>

      {/* البحث */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={`بحث في ${vocab.servicePlural}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
        />
      </div>

      {/* القائمة */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <PackagePlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-black text-slate-500">لا يوجد {vocab.serviceSingular} حالياً</p>
          <p className="text-xs text-slate-400 mt-1">أضف {vocab.serviceSingular} لبدء استقبال الحجوزات</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((svc, idx) => (
            <div key={svc.id || idx} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Scissors className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 truncate text-right">{svc.name}</p>
                <p className="text-xs text-slate-500 text-right">{svc.duration ? `${svc.duration} دقيقة` : ''}</p>
              </div>
              <div className="flex items-center gap-4">
                {svc.price != null && (
                  <p className="font-black text-slate-900 text-sm">{svc.price} ج.م</p>
                )}
                <button
                  onClick={() => handleDeleteService(svc.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال الإضافة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">إضافة {vocab.serviceSingular} جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddService} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 block text-right">الاسم</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كشف استشاري"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-right"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 block text-right">السعر (ج.م)</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="مثال: 150"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-right"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 block text-right">المدة (بالدقائق)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="مثال: 30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-right"
                />
              </div>

              <div className="flex gap-3 pt-4 flex-row-reverse">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingServicesPage;

