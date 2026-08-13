'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import UnifiedBuilder from '@/components/builder/unified/UnifiedBuilder';
import { updateBuilderConfig, publishBuilderConfig } from '@/lib/api/builder';

export default function ReservationsBuilderPage() {
  const { user, loading } = useAuth();

  if (loading || !user?.shopId) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        {loading ? 'جارٍ التحميل…' : 'لا يوجد متجر مرتبط بحسابك'}
      </div>
    );
  }

  const handleSave = async (config: any) => {
    await updateBuilderConfig(user.shopId!, config);
  };

  const handlePublish = async () => {
    await publishBuilderConfig(user.shopId!);
  };

  return (
    <UnifiedBuilder
      shopId={user.shopId!}
      activityType="RESERVATIONS"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}