import React from 'react';
import { CheckCircle2, Eye } from 'lucide-react';

type Props = { sales: any[] };

const SalesTab: React.FC<Props> = ({ sales }) => (
  <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-10 flex-row-reverse">
      <h3 className="text-3xl font-black">سجل الفواتير والعمليات</h3>
      <div className="flex items-center gap-2 bg-green-50 text-green-600 px-6 py-2 rounded-full font-black text-xs">
        <CheckCircle2 size={16} /> {sales.length} عملية ناجحة
      </div>
    </div>
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full text-right border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الفاتورة</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ والوقت</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">التعداد</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">رسوم التوصيل</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">التفاصيل</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="p-6 font-black text-slate-900">#{String(sale.id).slice(0, 8).toUpperCase()}</td>
              <td className="p-6 text-slate-500 font-bold text-sm">{new Date(sale.created_at).toLocaleString('ar-EG')}</td>
              <td className="p-6 text-slate-500 font-black text-sm">{sale.items?.length || 0} صنف</td>
              <td className="p-6 text-slate-500 font-black text-sm">
                {(() => {
                  const raw = typeof sale?.notes === 'string' ? sale.notes : '';
                  const lines = raw.split(/\r?\n/).map((l: any) => String(l).trim()).filter(Boolean);
                  const feeLine = lines.find((l: any) => String(l).toUpperCase().startsWith('DELIVERY_FEE:'));
                  if (!feeLine) return '-';
                  const value = String(feeLine).split(':').slice(1).join(':').trim();
                  const n = Number(value);
                  if (Number.isNaN(n) || n < 0) return '-';
                  return `ج.م ${n}`;
                })()}
              </td>
              <td className="p-6">
                <span className="text-xl font-black text-[#00E5FF]">ج.م {sale.total.toLocaleString()}</span>
              </td>
              <td className="p-6 text-left">
                <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default SalesTab;
