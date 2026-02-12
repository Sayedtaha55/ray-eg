import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Search, Plus, Eye, Edit, Check, X, Loader2 } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';

const MotionDiv = motion.div as any;

const AdminShops: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shopStatusFilter, setShopStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'>('all');
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [allS, p] = await Promise.all([
        ApiService.getShops('all'),
        ApiService.getPendingShops(),
      ]);
      setShops(Array.isArray(allS) ? allS : []);
      setPendingShops(Array.isArray(p) ? p : []);
    } catch {
      addToast('فشل تحميل المتاجر', 'error');
      setShops([]);
      setPendingShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getShopDeliveryFee = (shop: any): number | null => {
    const raw = (shop?.layoutConfig as any)?.deliveryFee;
    const n = typeof raw === 'number' ? raw : raw == null ? NaN : Number(raw);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  };

  const editShopDeliveryFee = async (shop: any) => {
    try {
      const current = getShopDeliveryFee(shop);
      const raw = window.prompt('رسوم التوصيل الثابتة (ج.م)', current != null ? String(current) : '');
      if (raw == null) return;
      const fee = Number(String(raw).trim());
      if (Number.isNaN(fee) || fee < 0) return;
      await ApiService.updateMyShop({ shopId: String(shop.id), deliveryFee: fee });
      addToast('تم تحديث رسوم التوصيل', 'success');
      loadData();
    } catch {
      addToast('فشل تحديث رسوم التوصيل', 'error');
    }
  };

  const handleApprovalAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await ApiService.updateShopStatus(id, action);
      addToast(action === 'approved' ? 'تمت الموافقة على المحل' : 'تم رفض الطلب', 'success');
      loadData();
    } catch {
      addToast('فشلت العملية', 'error');
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter((shop: any) => {
      const matchesSearch = !searchTerm ||
        String(shop?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(shop?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = shopStatusFilter === 'all' || String(shop?.status || '').toUpperCase() === shopStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shops, searchTerm, shopStatusFilter]);

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">إدارة المتاجر</h2>
            <p className="text-slate-500 text-sm font-bold">متابعة وتحديث حالة المتاجر ورسوم التوصيل.</p>
          </div>
        </div>

        <button className="px-4 py-3 bg-[#00E5FF] text-black rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all">
          <Plus size={18} /> متجر جديد
        </button>
      </div>

      {pendingShops.length > 0 && (
        <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-6">
          <h3 className="text-white font-black text-lg mb-4">طلبات موافقة متاجر ({pendingShops.length})</h3>
          <div className="space-y-3">
            {pendingShops.slice(0, 6).map((shop: any) => (
              <div key={shop.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4 flex-row-reverse">
                  <img src={shop.logo_url} className="w-12 h-12 rounded-xl object-cover bg-slate-800" />
                  <div className="text-right">
                    <div className="text-white font-black">{shop.name}</div>
                    <div className="text-slate-500 text-xs font-bold">{shop.governorate} • {shop.city} • {shop.category}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprovalAction(shop.id, 'approved')} className="px-4 py-2 bg-green-500 text-white rounded-xl font-black text-xs flex items-center gap-2"><Check size={16} /> موافقة</button>
                  <button onClick={() => handleApprovalAction(shop.id, 'rejected')} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl font-black text-xs flex items-center gap-2"><X size={16} /> رفض</button>
                </div>
              </div>
            ))}
          </div>
        </MotionDiv>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث عن المتاجر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
            />
          </div>

          <select
            value={shopStatusFilter}
            onChange={(e) => setShopStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
          >
            <option value="all">جميع الحالات</option>
            <option value="APPROVED">نشط</option>
            <option value="PENDING">معلق</option>
            <option value="REJECTED">مرفوض</option>
            <option value="SUSPENDED">معطل</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">المتجر</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">الفئة</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">المدينة</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">رسوم التوصيل</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">الحالة</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop: any) => (
                <tr key={shop.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={shop.logoUrl || shop.logo_url || '/default-shop.png'} className="w-10 h-10 rounded-xl object-cover bg-slate-800" />
                      <div className="min-w-0">
                        <div className="text-white font-black truncate">{shop.name}</div>
                        <div className="text-slate-500 text-xs font-bold truncate">{shop.phone || shop.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-xl text-xs font-black">{shop.category}</span>
                  </td>
                  <td className="p-4 text-slate-300 font-bold text-sm">{shop.city}</td>
                  <td className="p-4 text-slate-300 font-bold text-sm">
                    <button onClick={() => editShopDeliveryFee(shop)} className="hover:text-[#00E5FF] transition-colors">
                      {getShopDeliveryFee(shop) ?? 0} ج.م
                    </button>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                      String(shop.status || '').toUpperCase() === 'APPROVED'
                        ? 'bg-green-500/20 text-green-400'
                        : String(shop.status || '').toUpperCase() === 'REJECTED'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {String(shop.status || '').toUpperCase() === 'APPROVED'
                        ? 'نشط'
                        : String(shop.status || '').toUpperCase() === 'REJECTED'
                          ? 'مرفوض'
                          : 'معلق'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white" title="عرض">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white" title="تعديل">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-12 text-slate-500 font-bold">
            {searchTerm || shopStatusFilter !== 'all' ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد متاجر'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShops;
