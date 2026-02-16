import React from 'react';
import { Tag } from 'lucide-react';
import { Offer } from '@/types';
import SmartImage from '@/components/common/ui/SmartImage';

type Props = {
  offers: Offer[];
  onDelete: (id: string) => void;
  onCreate: () => void;
};

const PromotionsTab: React.FC<Props> = ({ offers, onDelete, onCreate }) => (
  <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
    <div className="flex items-start md:items-center justify-between mb-10 flex-row-reverse gap-4">
      <h3 className="text-3xl font-black">مركز الترويج الفعال</h3>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-row-reverse w-full md:w-auto">
        <button
          onClick={onCreate}
          className="px-4 md:px-6 py-2 md:py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] md:text-xs flex items-center justify-center gap-2 hover:bg-black transition-all"
        >
          <Tag size={14} className="md:hidden" />
          <Tag size={16} className="hidden md:block" />
          إنشاء عرض جديد
        </button>
        <span className="bg-purple-100 text-[#BD00FF] px-4 md:px-6 py-2 rounded-full font-black text-[11px] md:text-xs uppercase text-center">{offers.length} عروض نشطة</span>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {offers.length === 0 ? (
        <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-bold">
          لا توجد عروض ترويجية نشطة حالياً.
        </div>
      ) : (
        offers.map((offer: any) => (
          <div key={offer.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col gap-6 group hover:shadow-xl transition-all">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-sm">
              <SmartImage
                src={offer.imageUrl}
                className="w-full h-full"
                imgClassName="object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 bg-[#BD00FF] text-white px-4 py-1.5 rounded-xl font-black text-sm shadow-xl shadow-purple-500/20">
                -{offer.discount}%
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-xl text-slate-900 mb-1">{offer.title}</p>
              <div className="flex items-center justify-end gap-4">
                <span className="text-slate-300 line-through font-bold">ج.م {offer.oldPrice}</span>
                <span className="text-[#BD00FF] font-black text-2xl">ج.م {offer.newPrice}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-4 bg-white border border-slate-100 rounded-2xl font-black text-xs text-slate-400">تعديل التصميم</button>
              <button
                onClick={() => onDelete(offer.id)}
                className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all"
              >
                إيقاف العرض
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default PromotionsTab;
