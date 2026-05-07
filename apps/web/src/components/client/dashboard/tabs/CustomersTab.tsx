'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, Search as SearchIcon, UserCheck, UserMinus } from 'lucide-react';
import * as merchantApi from '@/lib/api/merchant';
import { offlineDB, isOfflineError } from '@/lib/offline/offline-db';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

type Props = { shopId: string };

const CustomersTab: React.FC<Props> = ({ shopId }) => {
  const t = useT();
  const { dir } = useLocale();
  const locale = dir === 'rtl' ? 'ar-EG' : 'en-US';
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCustomers(); }, [shopId]);

  const loadCustomers = async () => {
    try {
      const data = await merchantApi.merchantGetCustomers(shopId);
      setCustomers(data);
    } catch (e) {
      if (isOfflineError(e)) {
        // No offline cache for customers yet — show empty
      }
    } finally { setLoading(false); }
  };

  const toggleStatus = async (id: string) => {
    try {
      const customer = customers.find((c) => c.id === id);
      const newStatus = customer.status === 'active' ? 'blocked' : 'active';
      await merchantApi.merchantUpdateCustomerStatus(id, newStatus);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    } catch {}
  };

  const filtered = customers.filter((c) => c.name?.includes(searchTerm) || c.email?.includes(searchTerm) || c.phone?.includes(searchTerm));

  if (loading) {
    return <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm"><div className="flex items-center justify-center py-20"><span className="text-slate-400 font-black">{t('business.customers.loading')}</span></div></div>;
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 flex-row-reverse">
        <h3 className="text-3xl font-black">{t('business.customers.database')}</h3>
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('business.customers.searchPlaceholder')}
            className="w-full bg-slate-50 rounded-2xl py-4 pr-14 pl-6 font-bold outline-none border-none text-right focus:ring-2 focus:ring-[#00E5FF]/20 transition-all" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.customers.customer')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.customers.phone')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.customers.totalPurchases')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.customers.orderCount')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('business.customers.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-300 font-bold">{searchTerm ? t('business.customers.noSearchResults') : t('business.customers.noData')}</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">{c.name?.charAt(0) || 'U'}</div>
                      <div><p className="font-black">{c.name || t('business.customers.unnamed')}</p><p className="text-xs text-slate-400 font-bold">{c.email || t('business.customers.noEmail')}</p></div>
                    </div>
                  </td>
                  <td className="p-6 font-black text-slate-900">{c.phone || '---'}</td>
                  <td className="p-6 font-black text-slate-900">{t('business.customers.currency')} {(c.totalSpent || 0).toLocaleString()}</td>
                  <td className="p-6 font-black text-slate-500">{c.orders || 0} {t('business.customers.orders')}</td>
                  <td className="p-6 text-left">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => toggleStatus(c.id)}
                        className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${c.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}>
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
