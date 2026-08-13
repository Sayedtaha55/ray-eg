import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  Apple,
  CheckCircle2,
  XCircle,
  Settings,
  Plug,
  FileText,
  ScrollText,
  RefreshCw,
  Download,
  BookOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Plus,
  Upload,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  SalesPageShell,
  SalesPageHeader,
  SalesStatsGrid,
  SalesStatusFilters,
  SalesToolbar,
  SalesEmptyState,
  SalesHelpfulSection,
  FilterField,
  FilterInput,
  type StatCard,
  type StatusFilter,
  type ToolbarAction,
  type SalesGuideData,
} from '../../components/SalesDesignSystem';

type Props = { shopId: string; shop?: any };

type Gateway = {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: LucideIcon;
  connected: boolean;
  color: string;
  bgColor: string;
};

const EpaymentPage: React.FC<Props> = ({ shopId, shop }) => {
  const { i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const gateways: Gateway[] = useMemo(() => [
    { id: 'stripe', name: 'Stripe', nameAr: 'سترايب', description: 'Accept credit cards globally', descriptionAr: 'استقبال بطاقات الائتمان عالمياً', icon: CreditCard, connected: shop?.paymentConfig?.stripe?.enabled || false, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'paypal', name: 'PayPal', nameAr: 'باي بال', description: 'PayPal wallet payments', descriptionAr: 'مدفوعات محفظة باي بال', icon: Wallet, connected: shop?.paymentConfig?.paypal?.enabled || false, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'paymob', name: 'Paymob', nameAr: 'بايموب', description: 'Egyptian payment gateway', descriptionAr: 'بوابة دفع مصرية', icon: CreditCard, connected: shop?.paymentConfig?.paymob?.enabled || false, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'fawry', name: 'Fawry', nameAr: 'فوري', description: 'Fawry reference codes', descriptionAr: 'أكواد مرجعية فوري', icon: Smartphone, connected: shop?.paymentConfig?.fawry?.enabled || false, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { id: 'meeza', name: 'Meeza', nameAr: 'ميزة', description: 'Meeza card payments', descriptionAr: 'مدفوعات بطاقة ميزة', icon: CreditCard, connected: shop?.paymentConfig?.meeza?.enabled || false, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { id: 'apple_pay', name: 'Apple Pay', nameAr: 'آبل باي', description: 'Apple Pay wallet', descriptionAr: 'محفظة آبل باي', icon: Apple, connected: shop?.paymentConfig?.applePay?.enabled || false, color: 'text-slate-700', bgColor: 'bg-slate-100' },
    { id: 'google_pay', name: 'Google Pay', nameAr: 'جوجل باي', description: 'Google Pay wallet', descriptionAr: 'محفظة جوجل باي', icon: Wallet, connected: shop?.paymentConfig?.googlePay?.enabled || false, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'cod', name: 'Cash on Delivery', nameAr: 'الدفع عند الاستلام', description: 'Pay with cash on delivery', descriptionAr: 'الدفع نقداً عند الاستلام', icon: Banknote, connected: true, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'bank_transfer', name: 'Bank Transfer', nameAr: 'تحويل بنكي', description: 'Direct bank transfer', descriptionAr: 'تحويل بنكي مباشر', icon: Banknote, connected: shop?.paymentConfig?.bankTransfer?.enabled || false, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ], [shop]);

  const filteredGateways = useMemo(() => {
    let result = gateways;
    if (filter === 'connected') result = result.filter(g => g.connected);
    else if (filter === 'disconnected') result = result.filter(g => !g.connected);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(q) || g.nameAr.includes(search));
    }
    return result;
  }, [gateways, filter, search]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const connected = gateways.filter(g => g.connected).length;
    const disconnected = gateways.length - connected;
    return { connected, disconnected, total: gateways.length };
  }, [gateways]);

  const statCards: StatCard[] = [
    { label: isArabic ? 'البوابات المتصلة' : 'Connected Gateways', value: stats.connected, icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: isArabic ? 'نشط' : 'active', direction: 'up' } },
    { label: isArabic ? 'غير المتصلة' : 'Disconnected', value: stats.disconnected, icon: XCircle, color: 'text-slate-600', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'بانتظار' : 'pending', direction: 'neutral' } },
    { label: isArabic ? 'المدفوعات الناجحة' : 'Successful Payments', value: '—', icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: '—', direction: 'neutral' } },
    { label: isArabic ? 'الفاشلة' : 'Failed Payments', value: '—', icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-50', trend: { value: '—', direction: 'neutral' } },
    { label: isArabic ? 'إجمالي التحصيل' : 'Total Collected', value: '—', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: '—', direction: 'neutral' } },
    { label: isArabic ? 'آخر مزامنة' : 'Last Sync', value: '—', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', trend: { value: '—', direction: 'neutral' } },
  ];

  /* ---- Guide ---- */
  const guide: SalesGuideData = {
    purpose: isArabic ? 'إدارة بوابات الدفع الإلكتروني وربطها بمتجرك. فعّل وسائل دفع متعددة لعملائك.' : 'Manage electronic payment gateways and connect them to your store. Enable multiple payment methods for your customers.',
    whenToUse: isArabic ? 'عند الحاجة لتفعيل أو إعداد بوابة دفع جديدة. لمتابعة حالة الاتصال لكل بوابة.' : 'When you need to activate or configure a new payment gateway. To monitor connection status of each gateway.',
    whatsInside: isArabic
      ? ['لوحة إحصائيات (بوابات متصلة، غير متصلة، مدفوعات ناجحة)', 'فلاتر (الكل، متصل، غير متصل)', 'بحث بالاسم', 'بطاقات بوابات الدفع', 'أزرر ربط وإعدادات']
      : ['Dashboard stats (connected, disconnected, successful payments)', 'Filters (all, connected, disconnected)', 'Search by name', 'Payment gateway cards', 'Connect and Settings buttons'],
    steps: isArabic
      ? [
          { title: 'اضغط "ربط"', description: 'لتفعيل بوابة دفع جديدة' },
          { title: 'اضغط "إعدادات"', description: 'لتكوين بوابة متصلة بالفعل' },
          { title: 'استخدم الفلاتر', description: 'لتصفية البوابات حسب حالة الاتصال' },
          { title: 'استخدم البحث', description: 'للعثور سريعاً على بوابة بالاسم' },
        ]
      : [
          { title: 'Click "Connect"', description: 'To activate a new payment gateway' },
          { title: 'Click "Settings"', description: 'To configure an already connected gateway' },
          { title: 'Use filters', description: 'To filter gateways by connection status' },
          { title: 'Use search', description: 'To quickly find a gateway by name' },
        ],
    bestPractices: isArabic
      ? ['فعّل أكثر من بوابة دفع لزيادة خيارات العملاء', 'اختبر كل بوابة قبل الإطلاق', 'الدفع عند الاستلام متاح دائماً', 'بوابات مثل Paymob وFawry مناسبة للسوق المصري']
      : ['Enable multiple gateways to increase customer options', 'Test each gateway before going live', 'Cash on Delivery is always available', 'Gateways like Paymob and Fawry are suited for the Egyptian market'],
    tips: isArabic
      ? ['راقب المدفوعات الفاشلة لتحديد المشاكل', 'فعّل Apple Pay و Google Pay لزيادة التحويل', 'التحقق من حالة الاتصال بانتظام']
      : ['Monitor failed payments to identify issues', 'Enable Apple Pay and Google Pay to increase conversion', 'Check connection status regularly'],
    shortcuts: isArabic
      ? ['استخدم البحث للعثور سريعاً على بوابة بالاسم', 'الفلاتر تعرض المتصلة وغير المتصلة', 'اضغط ESC لإغلاق النوافذ']
      : ['Use search to quickly find a gateway by name', 'Filters show connected vs disconnected', 'Press ESC to close dialogs'],
    relatedLinks: [
      { label: isArabic ? 'المدفوعات' : 'Payments', onClick: () => {} },
      { label: isArabic ? 'الطلبات' : 'Orders', onClick: () => {} },
    ],
  };

  const statusFilters: StatusFilter[] = [
    { key: 'all', label: isArabic ? 'الكل' : 'ALL', count: stats.total, color: '', activeColor: 'bg-slate-900 text-white' },
    { key: 'connected', label: isArabic ? 'متصل' : 'Connected', count: stats.connected, color: '', activeColor: 'bg-green-50 text-green-600' },
    { key: 'disconnected', label: isArabic ? 'غير متصل' : 'Disconnected', count: stats.disconnected, color: '', activeColor: 'bg-slate-100 text-slate-600' },
  ];

  const advancedFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <FilterField label={isArabic ? 'النوع' : 'Type'}><FilterInput placeholder={isArabic ? 'نوع البوابة' : 'Gateway type'} /></FilterField>
      <FilterField label={isArabic ? 'الحالة' : 'Status'}><FilterInput placeholder={isArabic ? 'حالة الاتصال' : 'Connection status'} /></FilterField>
      <FilterField label={isArabic ? 'العملة' : 'Currency'}><FilterInput placeholder={isArabic ? 'العملة' : 'Currency'} /></FilterField>
      <FilterField label={isArabic ? 'التاريخ' : 'Date'}><FilterInput type="date" /></FilterField>
    </div>
  );

  const toolbarActions: ToolbarAction[] = [
    { label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} },
    { label: isArabic ? 'تحديث' : 'Refresh', icon: RefreshCw, onClick: () => {} },
  ];

  return (
    <SalesPageShell>
      <SalesPageHeader
        icon={CreditCard}
        title={isArabic ? 'الدفع الإلكتروني' : 'E-Payment'}
        subtitle={isArabic ? 'إدارة بوابات الدفع الإلكتروني وربطها بمتجرك' : 'Manage electronic payment gateways and connect them to your store'}
        guide={guide}
        secondaryActions={[
          { label: isArabic ? 'دليل الاستخدام' : 'User Guide', icon: BookOpen, onClick: () => {} },
        ]}
      />

      <SalesStatsGrid stats={statCards} />

      <SalesStatusFilters filters={statusFilters} active={filter} onChange={setFilter} />

      <SalesToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isArabic ? 'بحث عن بوابة دفع...' : 'Search payment gateways...'}
        actions={toolbarActions}
        advancedFilters={advancedFilters}
      />

      {filteredGateways.length === 0 && !search && filter === 'all' ? (
        <SalesEmptyState
          emoji="💳"
          icon={CreditCard}
          title={isArabic ? 'لا توجد بوابات دفع' : 'No payment gateways'}
          description={isArabic ? 'فعّل بوابات الدفع الإلكتروني لاستقبال مدفوعات العملاء عبر بطاقات الائتمان والمحافظ الرقمية.' : 'Enable electronic payment gateways to accept customer payments via credit cards and digital wallets.'}
          primaryAction={{ label: isArabic ? 'دليل الاستخدام' : 'User Guide', icon: BookOpen, onClick: () => {} }}
          secondaryActions={[
            { label: isArabic ? 'إضافة بوابة' : 'Add Gateway', icon: Plus, onClick: () => {} },
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGateways.map((g) => (
            <div key={g.id} className="border border-slate-200 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${g.bgColor} ${g.color}`}>
                  <g.icon size={24} />
                </div>
                {g.connected ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-semibold">
                    <CheckCircle2 size={12} /> {isArabic ? 'متصل' : 'Connected'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                    <XCircle size={12} /> {isArabic ? 'غير متصل' : 'Not Connected'}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{isArabic ? g.nameAr : g.name}</h4>
              <p className="text-xs text-slate-400 font-medium mb-4 leading-relaxed">{isArabic ? g.descriptionAr : g.description}</p>
              <div className="flex items-center gap-2 mb-3">
                <button className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  g.connected ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}>
                  {g.connected ? <><Settings size={14} /> {isArabic ? 'إعدادات' : 'Settings'}</> : <><Plug size={14} /> {isArabic ? 'ربط' : 'Connect'}</>}
                </button>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                  <ScrollText size={12} /> {isArabic ? 'السجلات' : 'Logs'}
                </button>
                <span className="text-slate-200">|</span>
                <button className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                  <FileText size={12} /> {isArabic ? 'التوثيق' : 'Docs'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <SalesHelpfulSection
        tips={isArabic
          ? ['راقب المدفوعات الفاشلة لتحديد المشاكل', 'فعّل Apple Pay و Google Pay لزيادة التحويل', 'التحقق من حالة الاتصال بانتظام']
          : ['Monitor failed payments to identify issues', 'Enable Apple Pay and Google Pay to increase conversion', 'Check connection status regularly']
        }
        documentation={[
          { label: isArabic ? 'دليل بوابات الدفع' : 'Payment Gateways Guide', onClick: () => {} },
          { label: isArabic ? 'إعداد Stripe' : 'Stripe Setup', onClick: () => {} },
        ]}
        nextSteps={[
          { label: isArabic ? 'ربط بوابة جديدة' : 'Connect New Gateway', description: isArabic ? 'ابدأ بتفعيل Paymob أو Fawry' : 'Start with Paymob or Fawry', onClick: () => {} },
          { label: isArabic ? 'اختبار بوابة' : 'Test Gateway', description: isArabic ? 'اختبر بوابة قبل الإطلاق' : 'Test a gateway before going live', onClick: () => {} },
        ]}
      />
    </SalesPageShell>
  );
};

export default EpaymentPage;
