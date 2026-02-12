import React, { useEffect, useState } from 'react';
import { Megaphone, Search as SearchIcon, UserCheck, UserMinus } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';

type Props = { shopId: string };

const CustomersTab: React.FC<Props> = ({ shopId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, [shopId]);

  const loadCustomers = async () => {
    try {
      const data = await ApiService.getShopCustomers(shopId);
      setCustomers(data);
    } catch {
      addToast('فشل تحميل بيانات العملاء', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const customer = customers.find((c) => c.id === id);
      const newStatus = customer.status === 'active' ? 'blocked' : 'active';
      await ApiService.updateCustomerStatus(id, newStatus);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      addToast(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} حساب العميل`, 'success');
    } catch {
      addToast('فشل تحديث حالة العميل', 'error');
    }
  };

  const sendPromotion = async (customerId: string) => {
    try {
      await ApiService.sendCustomerPromotion(customerId, shopId);
      addToast('تم إرسال العرض الترويجي بنجاح', 'success');
    } catch {
      addToast('فشل إرسال العرض', 'error');
    }
  };

  const filtered = customers.filter((c) => c.name?.includes(searchTerm) || c.email?.includes(searchTerm) || c.phone?.includes(searchTerm));

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-center py-20">
          <span className="text-slate-400 font-black">تحميل بيانات العملاء...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 flex-row-reverse">
        <h3 className="text-3xl font-black">قاعدة بيانات العملاء</h3>
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم العميل أو بريده..."
            className="w-full bg-slate-50 rounded-2xl py-4 pr-14 pl-6 font-bold outline-none border-none text-right focus:ring-2 focus:ring-[#00E5FF]/20 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">العميل</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الهاتف</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المشتريات</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">عدد الطلبات</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">آخر عملية</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">التحكم</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-300 font-bold">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد بيانات عملاء حالياً. العملاء سيظهرون هنا عند تحويل الحجوزات المكتملة'}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                        {c.name?.charAt(0) || 'ع'}
                      </div>
                      <div>
                        <p className="font-black">{c.name || 'عميل غير محدد'}</p>
                        <p className="text-xs text-slate-400 font-bold">{c.email || 'لا يوجد بريد'}</p>
                        {c.convertedFromReservation && (
                          <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-black">محول من حجز</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 font-black text-slate-900">{c.phone || '---'}</td>
                  <td className="p-6 font-black text-slate-900">ج.م {(c.totalSpent || 0).toLocaleString()}</td>
                  <td className="p-6 font-black text-slate-500">{c.orders || 0} طلبات</td>
                  <td className="p-6">
                    <div>
                      <p className="text-xs text-slate-400 font-black">
                        {c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString('ar-EG') : '---'}
                      </p>
                      {c.firstPurchaseItem && <p className="text-[10px] text-slate-500">{c.firstPurchaseItem}</p>}
                    </div>
                  </td>
                  <td className="p-6 text-left">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => sendPromotion(c.id)}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-black text-[10px] hover:bg-purple-600 hover:text-white transition-all"
                      >
                        <Megaphone size={12} />
                      </button>
                      <button
                        onClick={() => toggleStatus(c.id)}
                        className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          c.status === 'active'
                            ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                            : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'
                        }`}
                      >
                        {c.status === 'active' ? <UserMinus size={12} /> : <UserCheck size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersTab;
