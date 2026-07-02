/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingProvidersPage.tsx
 * صفحة مقدمي الخدمة - أطباء، خبراء، مدربين، إلخ
 * ═══════════════════════════════════════════
 */
import React, { useEffect, useState } from 'react';
import { Users, Plus, Loader2, Search, UserPlus, Trash2, X } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { getVocabulary } from '../config';
import { ApiService } from '@/services/api.service';

type Props = {
  activityType: BookingActivityType;
  loading?: boolean;
};

const BookingProvidersPage: React.FC<Props> = ({ activityType }) => {
  const vocab = getVocabulary(activityType);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
    if (!shop?.id) { setLoading(false); return; }

    ApiService.getShopProviders?.(shop.id, activityType)
      .then((data: any) => setProviders(Array.isArray(data) ? data : []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [activityType]);

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
    if (!shop?.id) return;

    setSubmitting(true);
    try {
      await ApiService.addShopProvider?.({
        shopId: shop.id,
        activityType,
        name: name.trim(),
        specialty: specialty.trim() || vocab.providerSingular,
      });
      setName('');
      setSpecialty('');
      setIsModalOpen(false);
      loadData();
    } catch {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
    try {
      await ApiService.deleteShopProvider?.(id, activityType);
      loadData();
    } catch {
      // error handling
    }
  };

  const filtered = providers.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-bold text-slate-400">جاري تحميل {vocab.providerSingular}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">{vocab.providerPlural}</h2>
            <p className="text-xs text-slate-500">{providers.length} {vocab.providerSingular}</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00E5FF] text-white rounded-xl font-bold text-sm hover:bg-[#00B8D4] transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة {vocab.providerSingular}
        </button>
      </div>

      {/* البحث */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={`بحث في ${vocab.providerPlural}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 focus:border-[#00E5FF]"
        />
      </div>

      {/* القائمة */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-black text-slate-500">لا يوجد {vocab.providerSingular} حالياً</p>
          <p className="text-xs text-slate-400 mt-1">أضف {vocab.providerSingular} لبدء استقبال الحجوزات</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((provider, idx) => (
            <div key={provider.id || idx} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-emerald-100 flex items-center justify-center text-lg font-black text-[#0097A7]">
                {(provider.name || '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 truncate text-right">{provider.name}</p>
                <p className="text-xs text-slate-500 text-right">{provider.specialty || provider.role || vocab.serviceSingular}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${provider.active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {provider.active !== false ? 'نشط' : 'غير نشط'}
                </span>
                <button
                  onClick={() => handleDeleteProvider(provider.id)}
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
              <h3 className="font-black text-slate-900 text-base">إضافة {vocab.providerSingular} جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProvider} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 block text-right">الاسم</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. أحمد خالد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 focus:border-[#00E5FF] text-right"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 block text-right">التخصص / المسمى</label>
                <input
                  type="text"
                  placeholder="مثال: طب عام / استشاري"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 focus:border-[#00E5FF] text-right"
                />
              </div>

              <div className="flex gap-3 pt-4 flex-row-reverse">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#00E5FF] hover:bg-[#00B8D4] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
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

export default BookingProvidersPage;

