'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const MerchantDashboardPage = dynamic(
  () => import('@/components/client/dashboard/MerchantDashboardPage'),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
        <p className="font-black text-slate-400">Loading dashboard...</p>
      </div>
    }>
      <MerchantDashboardPage />
    </Suspense>
  );
}
