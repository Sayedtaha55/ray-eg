'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import CustomerForm, {
  EMPTY_CUSTOMER,
  CustomerFormValues,
} from '@/components/customers/CustomerForm';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const { shop } = useShop();
  const shopId = shop?.id || '';
  const customerId = String(params?.id || '');
  const [initial, setInitial] = useState<CustomerFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shopId || !customerId) return;
    (async () => {
      try {
        const c = await apiRequest(`/shops/${shopId}/customers/${customerId}`);
        const data = c?.data ?? c;
        if (!data?.id) {
          setNotFound(true);
          return;
        }
        setInitial({
          ...EMPTY_CUSTOMER,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || 'مصر',
          customerType: data.customerType === 'company' ? 'company' : 'individual',
          companyName: data.companyName || '',
          taxNumber: data.taxNumber || '',
          branch: data.branch || '',
          source: data.source || 'manual',
          segmentId: data.segmentId || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          notes: data.notes || '',
          shippingAddresses: Array.isArray(data.shippingAddresses) ? data.shippingAddresses : [],
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [shopId, customerId]);

  return (
    <div
      className="min-h-full bg-[#F4F5F7] text-slate-900"
      style={{ fontFamily: "'Cairo','Tajawal',system-ui,sans-serif" }}
    >
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-5 max-w-[1100px] mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">تعديل العميل</h1>
            <p className="text-xs text-slate-400 mt-0.5">عدّل بيانات العميل ثم احفظ التعديلات</p>
          </div>
          <Link
            href={`/dashboard/customers/${customerId}`}
            className="h-10 px-4 rounded-full border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <ChevronRight size={14} />
            رجوع للملف
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 mt-4 pb-8">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        ) : notFound || !initial ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <p className="text-slate-400 font-bold text-sm">العميل غير موجود</p>
            <button
              onClick={() => router.push('/dashboard/customers')}
              className="mt-3 text-xs font-bold text-slate-900 underline"
            >
              رجوع للعملاء
            </button>
          </div>
        ) : (
          <CustomerForm mode="edit" customerId={customerId} initial={initial} />
        )}
      </div>
    </div>
  );
}
