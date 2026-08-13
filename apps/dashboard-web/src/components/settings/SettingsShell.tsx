'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Settings as SettingsIcon, User, Shield, Store, CreditCard, Home, Bell,
  FileText, Puzzle, LayoutGrid, Clock, Share2, TrendingUp, Loader2, Save,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToast } from './ToastProvider';
import { apiRequest } from '@/lib/auth';

import OverviewTab from './tabs/OverviewTab';
import AccountTab from './tabs/AccountTab';
import SecurityTab from './tabs/SecurityTab';
import StoreTab from './tabs/StoreTab';
import BookingSettingsTab from './tabs/BookingSettingsTab';
import ModulesTab from './tabs/ModulesTab';
import AppsTab from './tabs/AppsTab';
import ReceiptThemeTab from './tabs/ReceiptThemeTab';
import PaymentsTab from './tabs/PaymentsTab';
import SocialMediaTab from './tabs/SocialMediaTab';
import NotificationsTab from './tabs/NotificationsTab';
import UpgradeTab from './tabs/UpgradeTab';

type SettingsTab =
  | 'overview' | 'account' | 'security' | 'store' | 'modules' | 'apps'
  | 'receipt_theme' | 'payments' | 'notifications' | 'booking_settings'
  | 'social_media' | 'upgrade';

type SaveHandler = () => Promise<boolean>;

interface SettingsShellProps {
  shop: any;
  onSaved: () => void;
}

export default function SettingsShell({ shop, onSaved }: SettingsShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Determine if shop is a booking activity
  const isBooking = (() => {
    const category = String(shop?.category || '').toUpperCase();
    return category === 'SERVICE' || category === 'BOOKING';
  })();

  // Build the list of available tabs (conditional like React app)
  const settingsTabs = React.useMemo(() => {
    const list: Array<{ id: SettingsTab; icon: React.ReactNode; label: string }> = [
      { id: 'overview', icon: <Home className="w-5 h-5" />, label: 'النظرة العامة' },
      { id: 'account', icon: <User className="w-5 h-5" />, label: 'الحساب' },
      { id: 'security', icon: <Shield className="w-5 h-5" />, label: 'الأمان' },
      { id: 'store', icon: <Store className="w-5 h-5" />, label: 'المتجر' },
      ...(isBooking ? [{ id: 'booking_settings' as const, icon: <Clock className="w-5 h-5" />, label: 'إعدادات الحجوزات' }] : []),
      { id: 'modules', icon: <Puzzle className="w-5 h-5" />, label: 'الوحدات' },
      { id: 'apps', icon: <LayoutGrid className="w-5 h-5" />, label: 'التطبيقات' },
      ...(!isBooking ? [{ id: 'receipt_theme' as const, icon: <FileText className="w-5 h-5" />, label: 'تصميم الإيصال' }] : []),
      { id: 'payments', icon: <CreditCard className="w-5 h-5" />, label: 'المدفوعات' },
      { id: 'social_media', icon: <Share2 className="w-5 h-5" />, label: 'السوشيال ميديا' },
      { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: 'الإشعارات' },
      { id: 'upgrade', icon: <TrendingUp className="w-5 h-5" />, label: 'الترقية والباقات' },
    ];
    return list;
  }, [isBooking]);

  const allowedTabs = new Set(settingsTabs.map((t) => t.id));
  const requestedTab = String(searchParams?.get('tab') || '').trim().toLowerCase() as SettingsTab;
  const activeTab: SettingsTab = allowedTabs.has(requestedTab) ? requestedTab : 'overview';

  const [sectionChangeCounts, setSectionChangeCounts] = useState<Record<string, number>>({});
  const sectionChangeCountsRef = useRef<Record<string, number>>({});
  const saveHandlersRef = useRef<Record<string, SaveHandler>>({});
  const [saving, setSaving] = useState(false);

  const changesCount = Object.values(sectionChangeCounts).reduce((sum, n) => sum + (Number.isFinite(n) ? Number(n) : 0), 0);

  useEffect(() => { sectionChangeCountsRef.current = sectionChangeCounts; }, [sectionChangeCounts]);

  // Listen for section changes and save handler registrations
  useEffect(() => {
    const onChanges = (e: any) => {
      const sectionId = String(e?.detail?.sectionId || '').trim();
      if (!sectionId) return;
      const count = Number.isFinite(Number(e?.detail?.count)) ? Math.max(0, Math.floor(Number(e?.detail?.count))) : 0;
      setSectionChangeCounts((prev) => (Number(prev[sectionId] ?? 0) === count ? prev : { ...prev, [sectionId]: count }));
    };
    const onRegister = (e: any) => {
      const sectionId = String(e?.detail?.sectionId || '').trim();
      const handler = e?.detail?.handler;
      if (!sectionId || typeof handler !== 'function') return;
      saveHandlersRef.current[sectionId] = handler as SaveHandler;
    };
    const onSaveRequest = async () => {
      const snapshot = sectionChangeCountsRef.current || {};
      const ids = Object.keys(snapshot).filter((k) => Number(snapshot[k] || 0) > 0);
      if (ids.length === 0) {
        toast({ title: 'لا توجد تغييرات', description: 'لم تقم بأي تعديلات بعد' });
        return;
      }
      setSaving(true);
      let okAll = true;
      const failedIds: string[] = [];
      for (const id of ids) {
        const fn = saveHandlersRef.current[id];
        if (!fn) { okAll = false; failedIds.push(id); continue; }
        try {
          const ok = await fn();
          if (!ok) { okAll = false; failedIds.push(id); }
        } catch {
          okAll = false;
          failedIds.push(id);
        }
      }
      if (okAll) {
        sectionChangeCountsRef.current = {};
        setSectionChangeCounts({});
      }
      setSaving(false);
      toast(
        okAll
          ? { title: 'تم الحفظ', description: 'تم حفظ الإعدادات بنجاح' }
          : { title: 'فشل الحفظ', description: `تعذر حفظ بعض الأقسام: ${failedIds.join(' | ')}`, variant: 'destructive' },
      );
    };
    window.addEventListener('merchant-settings-section-changes', onChanges as any);
    window.addEventListener('merchant-settings-register-save-handler', onRegister as any);
    window.addEventListener('merchant-settings-save-request', onSaveRequest as any);
    return () => {
      window.removeEventListener('merchant-settings-section-changes', onChanges as any);
      window.removeEventListener('merchant-settings-register-save-handler', onRegister as any);
      window.removeEventListener('merchant-settings-save-request', onSaveRequest as any);
    };
  }, [toast]);

  const handleTabClick = (tabId: SettingsTab) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', tabId);
    router.push(`/dashboard/settings?${params.toString()}`);
  };

  const handleSaveAll = () => {
    try {
      window.dispatchEvent(new Event('merchant-settings-save-request'));
    } catch {}
  };

  const renderTabContent = (tabId: SettingsTab) => {
    switch (tabId) {
      case 'overview': return <OverviewTab shop={shop} />;
      case 'account': return <AccountTab shop={shop} onSaved={onSaved} />;
      case 'security': return <SecurityTab shop={shop} onSaved={onSaved} />;
      case 'store': return <StoreTab shop={shop} onSaved={onSaved} />;
      case 'booking_settings': return <BookingSettingsTab shop={shop} onSaved={onSaved} />;
      case 'modules': return <ModulesTab shop={shop} onSaved={onSaved} />;
      case 'apps': return <AppsTab shop={shop} onSaved={onSaved} />;
      case 'receipt_theme': return <ReceiptThemeTab shop={shop} />;
      case 'payments': return <PaymentsTab shop={shop} onSaved={onSaved} />;
      case 'social_media': return <SocialMediaTab shop={shop} onSaved={onSaved} />;
      case 'notifications': return <NotificationsTab shop={shop} />;
      case 'upgrade': return <UpgradeTab shop={shop} onSaved={onSaved} />;
      default: return <OverviewTab shop={shop} />;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-row-reverse">
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <SettingsIcon size={24} className="text-[#00E5FF]" />
          </div>
          <div className="text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الإعدادات</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">إدارة بيانات المتجر والإعدادات</p>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveAll}
          disabled={saving || changesCount <= 0}
          className={`relative px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
            saving || changesCount <= 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-black'
          }`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>حفظ الإعدادات</span>
          {changesCount > 0 && (
            <span className="bg-[#00E5FF] text-slate-900 rounded-full px-2 py-0.5 text-[10px] font-black">
              {changesCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab content - full width without internal sidebar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {renderTabContent(activeTab)}
      </div>
    </div>
  );
}
