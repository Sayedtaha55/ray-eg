import React from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, ShieldCheck } from 'lucide-react';

const MotionDiv = motion.div as any;

interface ShopDetailsCardProps {
  shopName: string;
  shopCity: string;
  shopStatus: string;
  shopCategory: string;
}

const ShopDetailsCard: React.FC<ShopDetailsCardProps> = ({ shopName, shopCity, shopStatus, shopCategory }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="lg:col-span-7 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-10"
    >
      <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6">بيانات المتجر</h2>

      <div className="space-y-4">
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse text-slate-900 font-black">
            <Store className="w-5 h-5 text-slate-400" />
            <span>اسم المتجر</span>
          </div>
          <span className="font-bold text-slate-600">{shopName || '-'}</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse text-slate-900 font-black">
            <MapPin className="w-5 h-5 text-slate-400" />
            <span>المدينة</span>
          </div>
          <span className="font-bold text-slate-600">{shopCity || '-'}</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse text-slate-900 font-black">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <span>الحالة</span>
          </div>
          <span className="font-bold text-slate-600">{shopStatus || '-'}</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse text-slate-900 font-black">
            <Store className="w-5 h-5 text-slate-400" />
            <span>التصنيف</span>
          </div>
          <span className="font-bold text-slate-600">{shopCategory || '-'}</span>
        </div>
      </div>
    </MotionDiv>
  );
};

export default React.memo(ShopDetailsCard);
