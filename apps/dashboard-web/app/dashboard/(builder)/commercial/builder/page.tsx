'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import UnifiedBuilder from '@/components/builder/unified/UnifiedBuilder';
import { ActivityType } from '@/types/builder';
import { updateBuilderConfig, publishBuilderConfig } from '@/lib/api/builder';

export default function CommercialBuilderPage() {
  const { user, loading } = useAuth();

  // UnifiedBuilder expects a shopId. When the authenticated merchant has no
  // shop yet we can't render the editor — fall back to a loading state.
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
      activityType="COMMERCIAL"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}