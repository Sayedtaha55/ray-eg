'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function AdminCatchAll() {
  const pathname = usePathname();
  const segment = pathname.split('/').filter(Boolean).pop() || '';
  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">{segment}</h1>
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-12 text-center">
        <p className="text-slate-500 font-bold text-sm">هذه الصفحة قيد التطوير</p>
      </div>
    </div>
  );
}
