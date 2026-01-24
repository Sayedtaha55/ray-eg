import React, { useEffect, useRef, useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Store, CreditCard, Home, Bell, FileText, Image as ImageIcon, Loader2, ChevronDown } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { cn } from '@/lib/utils';
import { RayDB } from '@/constants';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Overview from './Overview';
import Account from './Account';
import Security from './Security';
import StoreSettings from './StoreSettings';
import Payments from './Payments';

const { Link, useLocation } = ReactRouterDOM as any;

type SettingsTab = 'overview' | 'account' | 'security' | 'store' | 'payments' | 'notifications' | 'receipt_theme';

const SettingsTabs = [
  { id: 'overview' as const, label: 'نظرة عامة', icon: <Home className="w-5 h-5" /> },
  { id: 'account' as const, label: 'الحساب', icon: <User className="w-5 h-5" /> },
  { id: 'security' as const, label: 'الأمان', icon: <Shield className="w-5 h-5" /> },
  { id: 'store' as const, label: 'إعدادات المتجر', icon: <Store className="w-5 h-5" /> },
  { id: 'receipt_theme' as const, label: 'ثيم الفاتورة', icon: <FileText className="w-5 h-5" /> },
  { id: 'payments' as const, label: 'المدفوعات', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'notifications' as const, label: 'التنبيهات', icon: <Bell className="w-5 h-5" /> },
];

interface SettingsProps {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
}

const ReceiptThemeSettings: React.FC<{ shop: any; adminShopId?: string }> = ({ shop, adminShopId }) => {
  const { toast } = useToast();
  const receiptLogoInputRef = useRef<HTMLInputElement>(null);
  const receiptShopId = String(adminShopId || shop?.id || '');
  const [receiptShopName, setReceiptShopName] = useState('');
  const [receiptPhone, setReceiptPhone] = useState('');
  const [receiptAddress, setReceiptAddress] = useState('');
  const [receiptLogoDataUrl, setReceiptLogoDataUrl] = useState('');
  const [receiptFooterNote, setReceiptFooterNote] = useState('');
  const [savingReceiptTheme, setSavingReceiptTheme] = useState(false);

  useEffect(() => {
    const theme = RayDB.getReceiptTheme(receiptShopId);
    setReceiptShopName(String((theme as any)?.shopName || shop?.name || ''));
    setReceiptPhone(String((theme as any)?.phone || shop?.phone || ''));
    setReceiptAddress(String((theme as any)?.address || shop?.addressDetailed || shop?.address_detailed || ''));
    setReceiptLogoDataUrl(String((theme as any)?.logoDataUrl || ''));
    setReceiptFooterNote(String((theme as any)?.footerNote || ''));
  }, [receiptShopId, shop?.name, shop?.phone, shop?.addressDetailed, shop?.address_detailed]);

  const handlePickReceiptLogo = () => {
    receiptLogoInputRef.current?.click();
  };

  const handleReceiptLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'خطأ', description: 'الصورة كبيرة جداً، يرجى اختيار صورة أقل من 2 ميجابايت', variant: 'destructive' });
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
      toast({ title: 'خطأ', description: 'لا يمكن حفظ ثيم الفاتورة بدون متجر', variant: 'destructive' });
      return;
    }
    setSavingReceiptTheme(true);
    try {
      RayDB.setReceiptTheme(receiptShopId, {
        shopName: receiptShopName,
        phone: receiptPhone,
        address: receiptAddress,
        logoDataUrl: receiptLogoDataUrl,
        footerNote: receiptFooterNote,
      });
      toast({ title: 'تم الحفظ', description: 'تم حفظ ثيم الفاتورة بنجاح' });
    } catch {
      toast({ title: 'خطأ', description: 'فشل حفظ ثيم الفاتورة', variant: 'destructive' });
    } finally {
      setSavingReceiptTheme(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h3 className="text-2xl font-black">ثيم الفاتورة</h3>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>ثيم الفاتورة</CardTitle>
          <CardDescription>خصّص بيانات الفاتورة (محليًا على هذا الجهاز).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="receiptShopName">اسم المتجر على الفاتورة</Label>
              <Input id="receiptShopName" value={receiptShopName} onChange={(e) => setReceiptShopName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptPhone">هاتف الفاتورة</Label>
              <Input id="receiptPhone" value={receiptPhone} onChange={(e) => setReceiptPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptAddress">عنوان الفاتورة</Label>
            <Input id="receiptAddress" value={receiptAddress} onChange={(e) => setReceiptAddress(e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>شعار الفاتورة (اختياري)</Label>
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
                  <Button type="button" onClick={handlePickReceiptLogo} variant="outline">اختيار شعار</Button>
                  <Button type="button" onClick={() => setReceiptLogoDataUrl('')} variant="secondary">حذف الشعار</Button>
                </div>
                <input ref={receiptLogoInputRef} type="file" hidden accept="image/*" onChange={handleReceiptLogoChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptFooterNote">ملاحظة أسفل الفاتورة</Label>
              <Input
                id="receiptFooterNote"
                value={receiptFooterNote}
                onChange={(e) => setReceiptFooterNote(e.target.value)}
                placeholder="شكراً لزيارتكم"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Button type="button" onClick={handleSaveReceiptTheme} disabled={savingReceiptTheme}>
            {savingReceiptTheme ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ ثيم الفاتورة'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const Settings: React.FC<SettingsProps> = ({ shop, onSaved, adminShopId }) => {
  const [openTab, setOpenTab] = useState<SettingsTab | null>('overview');
  const [sounds, setSounds] = useState(RayDB.getNotificationSounds());
  const [savedSoundId, setSavedSoundId] = useState(RayDB.getSelectedNotificationSoundId());
  const [pendingSoundId, setPendingSoundId] = useState(RayDB.getSelectedNotificationSoundId());
  const location = useLocation();

  const buildMerchantProfileUrl = () => {
    const params = new URLSearchParams(String(location?.search || ''));
    params.delete('tab');
    const qs = params.toString();
    return `/business/profile${qs ? `?${qs}` : ''}`;
  };

  useEffect(() => {
    const onSoundsUpdate = () => {
      setSounds(RayDB.getNotificationSounds());
      const current = RayDB.getSelectedNotificationSoundId();
      setSavedSoundId(current);
      setPendingSoundId((prev) => (prev ? prev : current));
    };
    window.addEventListener('notification-sounds-update', onSoundsUpdate);
    RayDB.syncNotificationSoundsFromPublic();
    return () => window.removeEventListener('notification-sounds-update', onSoundsUpdate);
  }, []);

  useEffect(() => {
    if (openTab !== 'notifications') return;
    RayDB.syncNotificationSoundsFromPublic();
  }, [openTab]);

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
      case 'receipt_theme':
        return <ReceiptThemeSettings shop={shop} adminShopId={adminShopId} />;
      case 'payments':
        return <Payments shop={shop} onSaved={onSaved} />;
      case 'notifications':
        return (
          <div className="space-y-6 text-right" dir="rtl">
            <h3 className="text-2xl font-black">التنبيهات</h3>
            <div className="space-y-6">
              <h3 className="text-2xl font-black">أصوات التنبيهات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اختيار الصوت</label>
                  <div className="space-y-3">
                    {sounds.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setPendingSoundId(String(s.id));
                        }}
                        className={`w-full px-6 py-4 rounded-2xl border font-black text-sm flex items-center justify-between ${pendingSoundId === String(s.id) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-900 border-slate-100 hover:bg-slate-100'}`}
                      >
                        <span>{String(s.name || 'صوت')}</span>
                        <span className="text-[10px] opacity-70">
                          {savedSoundId === String(s.id) ? 'محفوظ' : pendingSoundId === String(s.id) ? 'محدد' : ''}
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
                      تجربة الصوت
                    </button>
                    <button
                      onClick={() => {
                        const idToSave = String(pendingSoundId || '').trim();
                        if (!idToSave) return;
                        RayDB.setSelectedNotificationSoundId(idToSave);
                        setSavedSoundId(idToSave);
                      }}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm"
                    >
                      حفظ
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
          <h2 className="text-xl font-bold">الإعدادات</h2>
        </div>

        <div className="space-y-3">
          {SettingsTabs.map((tab) => {
            const isOpen = openTab === tab.id;
            return (
              <div key={tab.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenTab((prev) => (prev === tab.id ? null : tab.id))}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-4 text-right transition-colors',
                    isOpen ? 'bg-primary/5' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span className="ml-2">{tab.icon}</span>
                    <span className="font-medium text-gray-900">{tab.label}</span>
                  </div>
                  <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform', isOpen ? 'rotate-180' : '')} />
                </button>

                {isOpen ? (
                  <div className="p-4 border-t border-gray-200">
                    {renderTabContent(tab.id)}
                  </div>
                ) : null}
              </div>
            );
          })}

          <Link
            to={buildMerchantProfileUrl()}
            className={cn(
              'w-full flex items-center space-x-3 px-4 py-4 text-right rounded-lg transition-colors',
              'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            <span className="ml-2"><User className="w-5 h-5" /></span>
            <span className="font-medium">ملف التاجر</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Settings;
