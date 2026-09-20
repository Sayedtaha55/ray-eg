'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import CustomerForm from '@/components/customers/CustomerForm';

export default function NewCustomerPage() {
  return (
    <div
      className="min-h-full bg-[#F4F5F7] text-slate-900"
      style={{ fontFamily: "'Cairo','Tajawal',system-ui,sans-serif" }}
    >
      {/* هيدر موحد: سهم رجوع + عنوان */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-5 max-w-[1100px] mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">عميل جديد</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              الحد الأدنى: الاسم + رقم الهاتف — الباقي اختياري ويتكمل من ملف العميل
            </p>
          </div>
          <Link
            href="/dashboard/customers"
            className="h-10 px-4 rounded-full border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <ChevronRight size={14} />
            رجوع للعملاء
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 mt-4 pb-8">
        <CustomerForm mode="create" />
      </div>
    </div>
  );
}
