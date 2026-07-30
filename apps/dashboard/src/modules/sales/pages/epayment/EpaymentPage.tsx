import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, CreditCard, Loader2, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

const EpaymentPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const gateways = [
    { id: 'stripe', name: 'Stripe', nameAr: 'سترايب', icon: <CreditCard size={24} />, connected: shop?.paymentConfig?.stripe?.enabled || false, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'paypal', name: 'PayPal', nameAr: 'باي بال', icon: <CreditCard size={24} />, connected: shop?.paymentConfig?.paypal?.enabled || false, color: 'bg-blue-50 text-blue-600' },
    { id: 'fawry', name: 'Fawry', nameAr: 'فوري', icon: <Smartphone size={24} />, connected: shop?.paymentConfig?.fawry?.enabled || false, color: 'bg-amber-50 text-amber-600' },
    { id: 'vodafone_cash', name: 'Vodafone Cash', nameAr: 'فودافون كاش', icon: <Smartphone size={24} />, connected: shop?.paymentConfig?.vodafoneCash?.enabled || false, color: 'bg-red-50 text-red-600' },
    { id: 'instapay', name: 'InstaPay', nameAr: 'إنستا باي', icon: <Smartphone size={24} />, connected: shop?.paymentConfig?.instapay?.enabled || false, color: 'bg-purple-50 text-purple-600' },
    { id: 'cod', name: 'Cash on Delivery', nameAr: 'الدفع عند الاستلام', icon: <CreditCard size={24} />, connected: true, color: 'bg-green-50 text-green-600' },
  ];

  const stats = [
    { label: isArabic ? 'بوابات متصلة' : 'Connected Gateways', value: gateways.filter(g => g.connected).length, icon: <CheckCircle2 size={20} />, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'بوابات متاحة' : 'Available Gateways', value: gateways.length, icon: <CreditCard size={20} />, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الدفع الإلكتروني' : 'E-Payment'}</h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة بوابات الدفع الإلكتروني' : 'Manage electronic payment gateways'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gateways.map((g) => (
          <div key={g.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl ${g.color}`}>{g.icon}</div>
              {g.connected ? (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle2 size={14} /> {isArabic ? 'متصل' : 'Connected'}</span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><XCircle size={14} /> {isArabic ? 'غير متصل' : 'Not Connected'}</span>
              )}
            </div>
            <h4 className="font-black text-sm mb-1">{isArabic ? g.nameAr : g.name}</h4>
            <p className="text-xs text-slate-400 mb-3">{isArabic ? 'بوابة دفع إلكتروني' : 'Electronic payment gateway'}</p>
            <button className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${g.connected ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              {g.connected ? (isArabic ? 'إعدادات' : 'Settings') : (isArabic ? 'ربط' : 'Connect')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EpaymentPage;
