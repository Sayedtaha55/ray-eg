import React, { useEffect, useRef, useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Store, CreditCard, Home, Bell, FileText, Image as ImageIcon, Loader2, ChevronDown, Puzzle, LayoutGrid } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { cn } from '@/lib/utils';
import { RayDB } from '@/constants';
import { ApiService } from '@/services/api.service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import Overview from './Overview';
import Account from './Account';
import Security from './Security';
import StoreSettings from './StoreSettings';
import Payments from './Payments';
import ModulesSettings from './Modules';
import AppsTab from '@/components/pages/business/merchant-dashboard/tabs/AppsTab';

const { Link, useLocation, useNavigate } = ReactRouterDOM as any;

type SettingsTab = 'overview' | 'account' | 'security' | 'store' | 'modules' | 'apps' | 'receipt_theme' | 'payments' | 'notifications';

type SaveHandler = () => Promise<boolean>;

type SectionChangesHandlerDetail = { sectionId: string; count: number };

const SETTINGS_TAB_IDS = [
  { id: 'overview' as const, icon: <Home className="w-5 h-5" /> },
  { id: 'account' as const, icon: <User className="w-5 h-5" /> },
  { id: 'security' as const, icon: <Shield className="w-5 h-5" /> },
  { id: 'store' as const, icon: <Store className="w-5 h-5" /> },
  { id: 'modules' as const, icon: <Puzzle className="w-5 h-5" /> },
  { id: 'apps' as const, icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 'receipt_theme' as const, icon: <FileText className="w-5 h-5" /> },
  { id: 'payments' as const, icon: <CreditCard className="w-5 h-5" /> },
  { id: 'notifications' as const, icon: <Bell className="w-5 h-5" /> },
] as const;

interface SettingsProps {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
}

const ReceiptThemeSettings: React.FC<{ shop: any; adminShopId?: string }> = ({ shop, adminShopId }) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const receiptLogoInputRef = useRef<HTMLInputElement>(null);
  const receiptShopId = String(adminShopId || shop?.id || '');
  const [receiptShopName, setReceiptShopName] = useState('');
  const [receiptPhone, setReceiptPhone] = useState('');
  const [receiptCity, setReceiptCity] = useState('');
  const [receiptAddress, setReceiptAddress] = useState('');
  const [receiptLogoDataUrl, setReceiptLogoDataUrl] = useState('');
  const [receiptFooterNote, setReceiptFooterNote] = useState('');
  const [receiptVatRatePercent, setReceiptVatRatePercent] = useState('0');
  const [savingReceiptTheme, setSavingReceiptTheme] = useState(false);
  const [didLoadReceiptTheme, setDidLoadReceiptTheme] = useState(false);

  const resolvedVatRatePercent = (() => {
    const n = Number(receiptVatRatePercent);
    if (!Number.isFinite(n)) return 0;
    return Math.min(100, Math.max(0, n));
  })();

  const lastSavedRef = useRef({
    shopName: '',
    phone: '',
    city: '',
    address: '',
    logoDataUrl: '',
    footerNote: '',
    vatRatePercent: '0',
  });

  useEffect(() => {
    setDidLoadReceiptTheme(false);
    const layout = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? shop.layoutConfig : undefined;
    const theme = (layout as any)?.receiptTheme && typeof (layout as any).receiptTheme === 'object' ? (layout as any).receiptTheme : undefined;
    const legacy = (() => {
      try {
        return RayDB.getReceiptTheme(receiptShopId);
      } catch {
        return {};
      }
    })();
    const resolvedTheme = theme || legacy;

    setReceiptShopName(String((resolvedTheme as any)?.shopName || shop?.name || ''));
    setReceiptPhone(String((resolvedTheme as any)?.phone || shop?.phone || ''));
    setReceiptCity(String((resolvedTheme as any)?.city || shop?.city || ''));
    setReceiptAddress(String((resolvedTheme as any)?.address || shop?.addressDetailed || shop?.address_detailed || ''));
    setReceiptLogoDataUrl(String((resolvedTheme as any)?.logoDataUrl || ''));
    setReceiptFooterNote(String((resolvedTheme as any)?.footerNote || ''));
    setReceiptVatRatePercent(String((resolvedTheme as any)?.vatRatePercent ?? 0));

    lastSavedRef.current = {
      shopName: String((resolvedTheme as any)?.shopName || shop?.name || ''),
      phone: String((resolvedTheme as any)?.phone || shop?.phone || ''),
      city: String((resolvedTheme as any)?.city || shop?.city || ''),
      address: String((resolvedTheme as any)?.address || shop?.addressDetailed || shop?.address_detailed || ''),
      logoDataUrl: String((resolvedTheme as any)?.logoDataUrl || ''),
      footerNote: String((resolvedTheme as any)?.footerNote || ''),
      vatRatePercent: String((resolvedTheme as any)?.vatRatePercent ?? 0),
    };

    setDidLoadReceiptTheme(true);
  }, [receiptShopId, shop?.name, shop?.phone, shop?.city, shop?.addressDetailed, shop?.address_detailed]);

  useEffect(() => {
    const layout = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? shop.layoutConfig : undefined;
    const existing = (layout as any)?.receiptTheme;
    if (existing && typeof existing === 'object') return;
    if (!receiptShopId) return;
    const legacy = (() => {
      try {
        return RayDB.getReceiptTheme(receiptShopId);
      } catch {
        return null;
      }
    })();
    if (!legacy || typeof legacy !== 'object') return;
    const hasAny = Boolean(
      String((legacy as any)?.shopName || '').trim() ||
      String((legacy as any)?.phone || '').trim() ||
      String((legacy as any)?.city || '').trim() ||
      String((legacy as any)?.address || '').trim() ||
      String((legacy as any)?.logoDataUrl || '').trim() ||
      String((legacy as any)?.footerNote || '').trim() ||
      Number((legacy as any)?.vatRatePercent ?? 0) > 0,
    );
    if (!hasAny) return;

    ApiService.updateMyShop({
      ...(adminShopId ? { shopId: adminShopId } : {}),
      receiptTheme: {
        shopName: String((legacy as any)?.shopName || '').trim() || undefined,
        phone: String((legacy as any)?.phone || '').trim() || undefined,
        city: String((legacy as any)?.city || '').trim() || undefined,
        address: String((legacy as any)?.address || '').trim() || undefined,
        logoDataUrl: String((legacy as any)?.logoDataUrl || '').trim() || undefined,
        footerNote: String((legacy as any)?.footerNote || '').trim() || undefined,
        vatRatePercent: Number((legacy as any)?.vatRatePercent ?? 0) || 0,
      },
    }).catch(() => {});
  }, [adminShopId, receiptShopId, shop?.layoutConfig]);

  const emitReceiptChanges = (count: number) => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-section-changes', {
          detail: { sectionId: 'receipt_theme', count } satisfies SectionChangesHandlerDetail,
        }),
      );
    } catch {
    }
  };

  useEffect(() => {
    if (!didLoadReceiptTheme) return;
    const baseline = lastSavedRef.current;
    const count =
      (String(receiptShopName) !== String(baseline.shopName) ? 1 : 0) +
      (String(receiptPhone) !== String(baseline.phone) ? 1 : 0) +
      (String(receiptCity) !== String(baseline.city) ? 1 : 0) +
      (String(receiptAddress) !== String(baseline.address) ? 1 : 0) +
      (String(receiptLogoDataUrl) !== String(baseline.logoDataUrl) ? 1 : 0) +
      (String(receiptFooterNote) !== String(baseline.footerNote) ? 1 : 0) +
      (String(receiptVatRatePercent) !== String(baseline.vatRatePercent) ? 1 : 0);
    emitReceiptChanges(count);
  }, [didLoadReceiptTheme, receiptShopName, receiptPhone, receiptCity, receiptAddress, receiptLogoDataUrl, receiptFooterNote, receiptVatRatePercent]);

  useEffect(() => {
    if (!receiptShopId) return;
    if (savingReceiptTheme) return;
    if (!didLoadReceiptTheme) return;
    return;
  }, [receiptShopId, didLoadReceiptTheme, receiptShopName, receiptPhone, receiptCity, receiptAddress, receiptLogoDataUrl, receiptFooterNote, receiptVatRatePercent, resolvedVatRatePercent, savingReceiptTheme]);

  const handlePickReceiptLogo = () => {
    receiptLogoInputRef.current?.click();
  };

  const handleReceiptLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t('settingsIndex.error'), description: t('settingsIndex.imageTooLarge'), variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptLogoDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveReceiptTheme = async () => {
    if (!receiptShopId) {
      toast({ title: t('settingsIndex.error'), description: t('settingsIndex.noShopForReceipt'), variant: 'destructive' });
      return;
    }
    setSavingReceiptTheme(true);
    try {
      await ApiService.updateMyShop({
        ...(adminShopId ? { shopId: adminShopId } : {}),
        receiptTheme: {
          shopName: receiptShopName,
          phone: receiptPhone,
          city: receiptCity,
          address: receiptAddress,
          logoDataUrl: receiptLogoDataUrl,
          footerNote: receiptFooterNote,
          vatRatePercent: resolvedVatRatePercent,
        },
      });

      lastSavedRef.current = {
        shopName: String(receiptShopName),
        phone: String(receiptPhone),
        city: String(receiptCity),
        address: String(receiptAddress),
        logoDataUrl: String(receiptLogoDataUrl),
        footerNote: String(receiptFooterNote),
        vatRatePercent: String(receiptVatRatePercent),
      };
      emitReceiptChanges(0);
      toast({ title: t('settingsIndex.saved'), description: t('settingsIndex.receiptThemeSaved') });
      return true;
    } catch {
      toast({ title: t('settingsIndex.error'), description: t('settingsIndex.receiptThemeSaveFailed'), variant: 'destructive' });
      return false;
    } finally {
      setSavingReceiptTheme(false);
    }
  };

  useEffect(() => {
    const register = () => {
      try {
        window.dispatchEvent(
          new CustomEvent('merchant-settings-register-save-handler', {
            detail: { sectionId: 'receipt_theme', handler: handleSaveReceiptTheme as unknown as SaveHandler },
          }),
        );
      } catch {
      }
    };
    register();
  }, [receiptShopId, receiptShopName, receiptPhone, receiptCity, receiptAddress, receiptLogoDataUrl, receiptFooterNote, receiptVatRatePercent]);

  return (
    <div className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <h3 className="text-2xl font-black">{t('settingsIndex.receiptTheme')}</h3>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('settingsIndex.receiptTheme')}</CardTitle>
          <CardDescription>{t('settingsIndex.receiptThemeDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="receiptShopName">{t('settingsIndex.receiptShopName')}</Label>
              <Input id="receiptShopName" value={receiptShopName} onChange={(e) => setReceiptShopName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptPhone">{t('settingsIndex.receiptPhone')}</Label>
              <Input id="receiptPhone" value={receiptPhone} onChange={(e) => setReceiptPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptCity">{t('settingsIndex.receiptCity')}</Label>
            <Input id="receiptCity" value={receiptCity} onChange={(e) => setReceiptCity(e.target.value)} placeholder={t('settingsIndex.receiptCityPlaceholder')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptVatRatePercent">{t('settingsIndex.vatRatePercent')}</Label>
            <Input
              id="receiptVatRatePercent"
              type="number"
              min={0}
              max={100}
              value={receiptVatRatePercent}
              onChange={(e) => setReceiptVatRatePercent(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptAddress">{t('settingsIndex.receiptAddress')}</Label>
            <Input id="receiptAddress" value={receiptAddress} onChange={(e) => setReceiptAddress(e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('settingsIndex.receiptLogoOptional')}</Label>
              <div className="flex items-center gap-3">
                <div
                  onClick={handlePickReceiptLogo}
                  className="w-20 h-20 rounded-md overflow-hidden bg-slate-50 border border-slate-200 shrink-0 cursor-pointer flex items-center justify-center"
                >
                  {receiptLogoDataUrl ? (
                    <img src={receiptLogoDataUrl} className="w-full h-full object-cover" alt="receipt-logo" />
                  ) : (
                    <ImageIcon className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Button type="button" onClick={handlePickReceiptLogo} variant="outline">{t('settingsIndex.chooseLogo')}</Button>
                  <Button type="button" onClick={() => setReceiptLogoDataUrl('')} variant="secondary">{t('settingsIndex.deleteLogo')}</Button>
                </div>
                <input ref={receiptLogoInputRef} type="file" hidden accept="image/*" onChange={handleReceiptLogoChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptFooterNote">{t('settingsIndex.receiptFooterNote')}</Label>
              <Input
                id="receiptFooterNote"
                value={receiptFooterNote}
                onChange={(e) => setReceiptFooterNote(e.target.value)}
                placeholder={t('settingsIndex.receiptFooterNotePlaceholder')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Settings: React.FC<SettingsProps> = ({ shop, onSaved, adminShopId }) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const SettingsTabs = SETTINGS_TAB_IDS.map(item => ({
    ...item,
    label: t(`settingsIndex.tab${item.id.charAt(0).toUpperCase() + item.id.slice(1)}`),
  }));
  const [sounds, setSounds] = useState(RayDB.getNotificationSounds());
  const layout = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? shop.layoutConfig : undefined;
  const serverSoundId = String((layout as any)?.notificationSoundId || '').trim() || 'default';
  const [savedSoundId, setSavedSoundId] = useState(serverSoundId);
  const [pendingSoundId, setPendingSoundId] = useState(serverSoundId);
  const location = useLocation();
  const navigate = useNavigate();

  const [sectionChangeCounts, setSectionChangeCounts] = useState<Record<string, number>>({});
  const sectionChangeCountsRef = useRef<Record<string, number>>({});
  const saveHandlersRef = useRef<Record<string, SaveHandler>>({});

  const changesCount = Object.values(sectionChangeCounts).reduce((sum, n) => sum + (Number.isFinite(n) ? Number(n) : 0), 0);

  const params = new URLSearchParams(String(location?.search || ''));
  const requestedSettingsTabRaw = String(params.get('settingsTab') || '').trim().toLowerCase();
  const allowedTabs = new Set(SettingsTabs.map((tab) => String(tab.id)));
  const activeSettingsTab = (allowedTabs.has(requestedSettingsTabRaw) ? requestedSettingsTabRaw : 'overview') as SettingsTab;
  const sidebarMode = Boolean(requestedSettingsTabRaw);

  const buildMerchantProfileUrl = () => {
    const params = new URLSearchParams(String(location?.search || ''));
    params.delete('tab');
    params.delete('settingsTab');
    const qs = params.toString();
    return `/business/profile${qs ? `?${qs}` : ''}`;
  };

  useEffect(() => {
    setSavedSoundId(serverSoundId);
    setPendingSoundId((prev) => (prev ? prev : serverSoundId));
  }, [serverSoundId]);

  useEffect(() => {
    const onSoundsUpdate = () => {
      setSounds(RayDB.getNotificationSounds());
      setPendingSoundId((prev) => (prev ? prev : serverSoundId));
    };
    window.addEventListener('notification-sounds-update', onSoundsUpdate);
    RayDB.syncNotificationSoundsFromPublic();
    return () => window.removeEventListener('notification-sounds-update', onSoundsUpdate);
  }, [serverSoundId]);

  useEffect(() => {
    const existing = String((layout as any)?.notificationSoundId || '').trim();
    if (existing) return;
    const legacy = (() => {
      try {
        return String(RayDB.getSelectedNotificationSoundId() || '').trim();
      } catch {
        return '';
      }
    })();
    if (!legacy) return;
    ApiService.updateMyShop({
      ...(adminShopId ? { shopId: adminShopId } : {}),
      notificationSoundId: legacy,
    }).catch(() => {});
  }, [adminShopId, layout]);

  useEffect(() => {
    if (activeSettingsTab !== 'notifications') return;
    RayDB.syncNotificationSoundsFromPublic();
  }, [activeSettingsTab]);

  const emitSettingsStatus = (payload?: { saving?: boolean; ok?: boolean }) => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-status', {
          detail: {
            count: changesCount,
            saving: Boolean(payload?.saving),
            ok: payload?.ok,
          },
        }),
      );
    } catch {
    }
  };

  useEffect(() => {
    emitSettingsStatus({ saving: false });
  }, [changesCount]);

  useEffect(() => {
    sectionChangeCountsRef.current = sectionChangeCounts;
  }, [sectionChangeCounts]);

  useEffect(() => {
    const onChanges = (e: any) => {
      const sectionId = String(e?.detail?.sectionId || '').trim();
      if (!sectionId) return;
      const countRaw = Number(e?.detail?.count ?? 0);
      const count = Number.isFinite(countRaw) ? Math.max(0, Math.floor(countRaw)) : 0;
      setSectionChangeCounts((prev) => {
        if (Number(prev[sectionId] ?? 0) === count) return prev;
        return { ...prev, [sectionId]: count };
      });
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
        try {
          toast({ title: t('settingsIndex.noChanges'), description: t('settingsIndex.noChangesDesc') });
        } catch {
        }
        return;
      }
      emitSettingsStatus({ saving: true });
      let okAll = true;
      const failedIds: string[] = [];
      const failedReasons: Record<string, string> = {};
      for (const id of ids) {
        const fn = saveHandlersRef.current[id];
        if (!fn) {
          okAll = false;
          failedIds.push(id);
          failedReasons[id] = t('settingsIndex.sectionNotLoaded');
          continue;
        }
        try {
          const ok = await fn();
          if (!ok) {
            okAll = false;
            failedIds.push(id);
            if (!failedReasons[id]) failedReasons[id] = t('settingsIndex.couldNotSaveChanges');
          }
        } catch (e: any) {
          okAll = false;
          failedIds.push(id);
          const status = typeof e?.status === 'number' ? e.status : undefined;
          const msg = e?.message ? String(e.message) : '';
          const details = msg ? (status ? `${msg} (${status})` : msg) : status ? `(${status})` : '';
          failedReasons[id] = details || failedReasons[id] || t('settingsIndex.couldNotSaveChanges');
        }
      }

      if (okAll) {
        sectionChangeCountsRef.current = {};
        setSectionChangeCounts({});
      }
      emitSettingsStatus({ saving: false, ok: okAll });

      try {
        const resolveLabel = (sectionId: string) => {
          const idNorm = String(sectionId || '').trim();
          const known = SettingsTabs.find((tab) => String(tab.id) === idNorm);
          return String((known as any)?.label || idNorm || t('settingsIndex.section'));
        };

        const resolveFailure = (sectionId: string) => {
          const idNorm = String(sectionId || '').trim();
          const label = resolveLabel(idNorm);
          const reason = String(failedReasons[idNorm] || '').trim();
          return reason ? `${label}: ${reason}` : label;
        };

        toast(
          okAll
            ? { title: t('settingsIndex.saved'), description: t('settingsIndex.settingsSaved') }
            : {
                title: t('settingsIndex.saveFailed'),
                description:
                  failedIds.length > 0
                    ? t('settingsIndex.couldNotSaveSections', { sections: failedIds.map(resolveFailure).join(' | ') })
                    : t('settingsIndex.couldNotSaveSomeSettings'),
                variant: 'destructive',
              },
        );
      } catch {
      }
    };

    window.addEventListener('merchant-settings-section-changes', onChanges as any);
    window.addEventListener('merchant-settings-register-save-handler', onRegister as any);
    window.addEventListener('merchant-settings-save-request', onSaveRequest as any);
    return () => {
      window.removeEventListener('merchant-settings-section-changes', onChanges as any);
      window.removeEventListener('merchant-settings-register-save-handler', onRegister as any);
      window.removeEventListener('merchant-settings-save-request', onSaveRequest as any);
      try {
        window.dispatchEvent(new CustomEvent('merchant-settings-status', { detail: { count: 0, saving: false } }));
      } catch {
      }
    };
  }, []);

  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-section-changes', {
          detail: {
            sectionId: 'notifications',
            count: String(pendingSoundId || '') !== String(savedSoundId || '') ? 1 : 0,
          } satisfies SectionChangesHandlerDetail,
        }),
      );
    } catch {
    }
  }, [pendingSoundId, savedSoundId]);

  const saveNotifications = React.useCallback(async () => {
    const idToSave = String(pendingSoundId || '').trim();
    if (!idToSave) return false;
    try {
      await ApiService.updateMyShop({
        ...(adminShopId ? { shopId: adminShopId } : {}),
        notificationSoundId: idToSave,
      });
      setSavedSoundId(idToSave);
      return true;
    } catch {
      return false;
    }
  }, [adminShopId, pendingSoundId]);

  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-register-save-handler', {
          detail: {
            sectionId: 'notifications',
            handler: saveNotifications,
          },
        }),
      );
    } catch {
    }
  }, [saveNotifications]);

  const renderTabContent = (tabId: SettingsTab) => {
    switch (tabId) {
      case 'overview':
        return <Overview shop={shop} />;
      case 'account':
        return <Account shop={shop} onSaved={onSaved} adminShopId={adminShopId} />;
      case 'security':
        return <Security shop={shop} onSaved={onSaved} />;
      case 'store':
        return <StoreSettings shop={shop} onSaved={onSaved} adminShopId={adminShopId} />;
      case 'modules':
        return <ModulesSettings shop={shop} onSaved={onSaved} adminShopId={adminShopId} />;
      case 'apps':
        return <AppsTab />;
      case 'receipt_theme':
        return <ReceiptThemeSettings shop={shop} adminShopId={adminShopId} />;
      case 'payments':
        return <Payments shop={shop} onSaved={onSaved} adminShopId={adminShopId} />;
      case 'notifications':
        return (
          <div className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
            <h3 className="text-2xl font-black">{t('settingsIndex.notifications')}</h3>
            <div className="space-y-6">
              <h3 className="text-2xl font-black">{t('settingsIndex.notificationSounds')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('settingsIndex.chooseSound')}</label>
                  <div className="space-y-3">
                    {sounds.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setPendingSoundId(String(s.id));
                        }}
                        className={`w-full px-6 py-4 rounded-2xl border font-black text-sm flex items-center justify-between ${pendingSoundId === String(s.id) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-900 border-slate-100 hover:bg-slate-100'}`}
                      >
                        <span>{String(s.name || t('settingsIndex.sound'))}</span>
                        <span className="text-[10px] opacity-70">
                          {savedSoundId === String(s.id) ? t('settingsIndex.savedLabel') : pendingSoundId === String(s.id) ? t('settingsIndex.selected') : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => {
                        const url = pendingSoundId
                          ? (sounds.find((s: any) => String(s.id) === String(pendingSoundId))?.url || '')
                          : '';
                        if (!url) return;
                        const audio = new Audio(String(url));
                        audio.play().catch(() => {});
                      }}
                      className="flex-1 py-4 bg-[#00E5FF] text-slate-900 rounded-2xl font-black text-sm"
                    >
                      {t('settingsIndex.testSound')}
                    </button>
                  </div>
                </div>
                <div />
              </div>
            </div>
          </div>
        );
      default:
        return <Overview shop={shop} />;
    }
  };

  return (
    <div className="h-full bg-gray-50 rounded-lg overflow-hidden">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">{t('settingsIndex.settings')}</h2>
        </div>

        <div className="space-y-3">
          {sidebarMode ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className={cn(String(activeSettingsTab) === 'overview' ? 'block' : 'hidden')}>
                  {renderTabContent('overview')}
                </div>
                <div className={cn(String(activeSettingsTab) === 'account' ? 'block' : 'hidden')}>
                  {renderTabContent('account')}
                </div>
                <div className={cn(String(activeSettingsTab) === 'security' ? 'block' : 'hidden')}>
                  {renderTabContent('security')}
                </div>
                <div className={cn(String(activeSettingsTab) === 'store' ? 'block' : 'hidden')}>
                  {renderTabContent('store')}
                </div>
                <div className={cn(String(activeSettingsTab) === 'modules' ? 'block' : 'hidden')}>
                  {renderTabContent('modules')}
                </div>
                <div className={cn(String(activeSettingsTab) === 'apps' ? 'block' : 'hidden')}>
                  {renderTabContent('apps')}
                </div>
                <div className={cn(String(activeSettingsTab) === 'receipt_theme' ? 'block' : 'hidden')}>
                  {renderTabContent('receipt_theme')}
                </div>
                <div className={cn(String(activeSettingsTab) === 'payments' ? 'block' : 'hidden')}>
                  {renderTabContent('payments')}
                </div>
                <div className={cn(String(activeSettingsTab) === 'notifications' ? 'block' : 'hidden')}>
                  {renderTabContent('notifications')}
                </div>
              </div>
            </div>
          ) : (
            SettingsTabs.map((tab) => {
              return (
                <div key={tab.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      const current = String(tab.id);
                      const next = current === activeSettingsTab ? 'overview' : current;
                      const nextParams = new URLSearchParams(String(location?.search || ''));
                      nextParams.set('settingsTab', next);
                      navigate(`/business/dashboard?${nextParams.toString()}`);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-4 text-right transition-colors',
                      String(activeSettingsTab) === String(tab.id) ? 'bg-primary/5' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="ml-2">{tab.icon}</span>
                      <span className="font-medium text-gray-900">{tab.label}</span>
                    </div>
                    <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform', String(activeSettingsTab) === String(tab.id) ? 'rotate-180' : '')} />
                  </button>
                </div>
              );
            })
          )}

          <Link
            to={buildMerchantProfileUrl()}
            className={cn(
              'w-full flex items-center space-x-3 px-4 py-4 text-right rounded-lg transition-colors',
              'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            <span className="ml-2"><User className="w-5 h-5" /></span>
            <span className="font-medium">{t('settingsIndex.merchantProfile')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Settings;
